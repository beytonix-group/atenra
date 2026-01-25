import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { cartItems, users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser, canManageUserCarts } from "@/lib/auth-helpers";
import { logClearAll, getClientIp } from "@/lib/cart-audit";
import { broadcastCartCleared } from "@/lib/cart-broadcast";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

// DELETE - Clear all items from a user's cart
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

    const { userId } = await params;
    const targetUserId = parseInt(userId, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
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

    // Count items before clearing (for audit log)
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(cartItems)
      .where(eq(cartItems.userId, targetUserId))
      .get();

    const itemCount = countResult?.count ?? 0;

    if (itemCount === 0) {
      return NextResponse.json({ message: "Cart is already empty", itemsRemoved: 0 });
    }

    // Delete all items
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, targetUserId))
      .run();

    // Log the action for audit (non-blocking - cart operation was successful)
    const ipAddress = getClientIp(request);
    try {
      await logClearAll(targetUserId, currentUser.id, itemCount, ipAddress);
    } catch (auditError) {
      console.error('Audit logging failed:', {
        error: auditError instanceof Error ? auditError.message : String(auditError),
        action: 'clear_all',
        targetUserId,
        adminUserId: currentUser.id,
      });
      // Continue - the cart operation was still successful
    }

    // Broadcast via WebSocket (non-blocking)
    broadcastCartCleared(
      targetUserId,
      { userId: currentUser.id, role: 'agent' }
    ).catch((error) => {
      console.error('Failed to broadcast cart cleared:', {
        error: error instanceof Error ? error.message : String(error),
        targetUserId,
      });
    });

    return NextResponse.json({
      message: "Cart cleared successfully",
      itemsRemoved: itemCount,
    });
  } catch (error) {
    console.error("Error clearing user cart:", error);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
