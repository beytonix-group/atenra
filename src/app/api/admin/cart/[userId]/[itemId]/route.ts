import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { cartItems, users } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser, canManageUserCarts } from "@/lib/auth-helpers";
import { logRemoveItem, logEditItem, getClientIp } from "@/lib/cart-audit";
import { broadcastItemRemoved, broadcastItemUpdated } from "@/lib/cart-broadcast";

interface RouteParams {
  params: Promise<{ userId: string; itemId: string }>;
}

// DELETE - Remove a specific item from a user's cart
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await canManageUserCarts();
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, itemId } = await params;
    const targetUserId = parseInt(userId);
    const targetItemId = parseInt(itemId);

    if (isNaN(targetUserId) || isNaN(targetItemId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, targetUserId))
      .get();

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the item before deleting (for audit log)
    const itemToDelete = await db
      .select({
        id: cartItems.id,
        title: cartItems.title,
        description: cartItems.description,
      })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, targetItemId),
          eq(cartItems.userId, targetUserId)
        )
      )
      .get();

    if (!itemToDelete) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the item
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.id, targetItemId),
          eq(cartItems.userId, targetUserId)
        )
      );

    // Log the action for audit (non-blocking - cart operation was successful)
    const ipAddress = getClientIp(request);
    try {
      await logRemoveItem(
        targetUserId,
        currentUser.id,
        itemToDelete,
        ipAddress
      );
    } catch (auditError) {
      console.error('Audit logging failed:', {
        error: auditError instanceof Error ? auditError.message : String(auditError),
        action: 'remove_item',
        targetUserId,
        adminUserId: currentUser.id,
      });
      // Continue - the cart operation was still successful
    }

    // Broadcast via WebSocket (non-blocking)
    broadcastItemRemoved(
      targetUserId,
      targetItemId,
      { userId: currentUser.id, role: 'agent' }
    ).catch((error) => {
      console.error('Failed to broadcast cart item removal:', {
        error: error instanceof Error ? error.message : String(error),
        targetUserId,
        itemId: targetItemId,
      });
    });

    return NextResponse.json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Error removing item from user cart:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}

// PATCH - Edit a specific item in a user's cart
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await canManageUserCarts();
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, itemId } = await params;
    const targetUserId = parseInt(userId);
    const targetItemId = parseInt(itemId);

    if (isNaN(targetUserId) || isNaN(targetItemId)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, targetUserId))
      .get();

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let body: {
      title?: string;
      description?: string | null;
      unitPriceCents?: number | null;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { title, description, unitPriceCents } = body;

    // Validate inputs
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      if (title.trim().length > 50) {
        return NextResponse.json({ error: "Title must be 50 characters or less" }, { status: 400 });
      }
    }

    if (description !== undefined && description !== null) {
      if (typeof description !== 'string' || description.length > 500) {
        return NextResponse.json({ error: "Description must be a string with 500 characters or less" }, { status: 400 });
      }
    }

    if (unitPriceCents !== undefined && unitPriceCents !== null) {
      const MAX_PRICE_CENTS = 100000000; // $1,000,000 max
      if (typeof unitPriceCents !== 'number' || unitPriceCents < 0 || !Number.isInteger(unitPriceCents) || unitPriceCents > MAX_PRICE_CENTS) {
        return NextResponse.json({ error: "Price must be a non-negative integer (cents) up to $1,000,000" }, { status: 400 });
      }
    }

    // Get the item before updating
    const item = await db
      .select({
        id: cartItems.id,
        title: cartItems.title,
        description: cartItems.description,
        unitPriceCents: cartItems.unitPriceCents,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, targetItemId),
          eq(cartItems.userId, targetUserId)
        )
      )
      .get();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    if (title !== undefined) {
      updates.title = title.trim();
      changes.title = { from: item.title, to: title.trim() };
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null;
      changes.description = { from: item.description, to: description?.trim() || null };
    }
    if (unitPriceCents !== undefined) {
      updates.unitPriceCents = unitPriceCents;
      changes.unitPriceCents = { from: item.unitPriceCents, to: unitPriceCents };
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Update the item
    await db
      .update(cartItems)
      .set({
        ...updates,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(cartItems.id, targetItemId));

    // Log the action for audit (non-blocking - cart operation was successful)
    const ipAddress = getClientIp(request);
    try {
      await logEditItem(
        targetUserId,
        currentUser.id,
        { id: item.id, title: updates.title as string ?? item.title, description: updates.description as string ?? item.description },
        changes,
        ipAddress
      );
    } catch (auditError) {
      console.error('Audit logging failed:', {
        error: auditError instanceof Error ? auditError.message : String(auditError),
        action: 'edit_item',
        targetUserId,
        adminUserId: currentUser.id,
      });
      // Continue - the cart operation was still successful
    }

    // Broadcast via WebSocket (non-blocking)
    broadcastItemUpdated(
      targetUserId,
      {
        id: targetItemId,
        title: (updates.title as string) ?? item.title,
        description: (updates.description as string | null) ?? item.description,
        quantity: item.quantity,
        unitPriceCents: (updates.unitPriceCents as number | null) ?? item.unitPriceCents,
      },
      { userId: currentUser.id, role: 'agent' }
    ).catch((error) => {
      console.error('Failed to broadcast cart item update:', {
        error: error instanceof Error ? error.message : String(error),
        targetUserId,
        itemId: targetItemId,
      });
    });

    return NextResponse.json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
