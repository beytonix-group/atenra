import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { cartItems, users } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, canManageUserCarts } from "@/lib/auth-helpers";
import { logAddItem, getClientIp } from "@/lib/cart-audit";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

// GET - Get a user's cart items
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Get the target user info
    const targetUser = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .get();

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get cart items
    const items = await db
      .select({
        id: cartItems.id,
        title: cartItems.title,
        description: cartItems.description,
        quantity: cartItems.quantity,
        addedByUserId: cartItems.addedByUserId,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
      })
      .from(cartItems)
      .where(eq(cartItems.userId, targetUserId))
      .orderBy(desc(cartItems.createdAt))
      .all();

    return NextResponse.json({
      user: {
        id: targetUser.id,
        email: targetUser.email,
        displayName: targetUser.displayName ||
          `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() ||
          targetUser.email,
      },
      items,
    });
  } catch (error) {
    console.error("Error getting user cart:", error);
    return NextResponse.json({ error: "Failed to get user cart" }, { status: 500 });
  }
}

// POST - Add an item to a user's cart
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const body = await request.json() as { title?: string; description?: string };
    const { title, description } = body;

    // Validate input
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (title.length > 50) {
      return NextResponse.json({ error: "Title must be 50 characters or less" }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: "Description must be 500 characters or less" }, { status: 400 });
    }

    // Insert the cart item
    const result = await db
      .insert(cartItems)
      .values({
        userId: targetUserId,
        title: title.trim(),
        description: description?.trim() || null,
        quantity: 1,
        addedByUserId: currentUser.id, // Track who added the item
      })
      .returning({ id: cartItems.id });

    const newItemId = result[0]?.id;

    if (newItemId === undefined) {
      console.error("Insert did not return an ID");
      return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
    }

    // Log the action for audit
    const ipAddress = getClientIp(request);
    await logAddItem(
      targetUserId,
      currentUser.id,
      { id: newItemId, title: title.trim(), description: description?.trim() },
      ipAddress
    );

    return NextResponse.json(
      { id: newItemId, message: "Item added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding item to user cart:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
