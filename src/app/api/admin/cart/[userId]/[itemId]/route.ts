import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { cartItems, users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser, canManageUserCarts } from "@/lib/auth-helpers";
import { logRemoveItem, getClientIp } from "@/lib/cart-audit";

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

    // Log the action for audit
    const ipAddress = getClientIp(request);
    await logRemoveItem(
      targetUserId,
      currentUser.id,
      itemToDelete,
      ipAddress
    );

    return NextResponse.json({ message: "Item removed successfully" });
  } catch (error) {
    console.error("Error removing item from user cart:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
