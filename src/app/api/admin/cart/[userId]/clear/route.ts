import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { cartItems, users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser, canManageUserCarts } from "@/lib/auth-helpers";
import { logClearAll, getClientIp } from "@/lib/cart-audit";

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
    const targetUserId = parseInt(userId);

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
      .where(eq(cartItems.userId, targetUserId));

    // Log the action for audit
    const ipAddress = getClientIp(request);
    await logClearAll(targetUserId, currentUser.id, itemCount, ipAddress);

    return NextResponse.json({
      message: "Cart cleared successfully",
      itemsRemoved: itemCount,
    });
  } catch (error) {
    console.error("Error clearing user cart:", error);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
