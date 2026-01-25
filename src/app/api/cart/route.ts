import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { cartItems } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { authenticateAndGetUser } from '@/lib/cart-helpers';
import { broadcastItemAdded, broadcastCartCleared } from '@/lib/cart-broadcast';

// GET - List all cart items for current user
export async function GET() {
  try {
    const { user, error } = await authenticateAndGetUser();
    if (error) return error;

    // Get cart items
    const items = await db
      .select({
        id: cartItems.id,
        title: cartItems.title,
        description: cartItems.description,
        quantity: cartItems.quantity,
        unitPriceCents: cartItems.unitPriceCents,
        addedByUserId: cartItems.addedByUserId,
        createdAt: cartItems.createdAt,
      })
      .from(cartItems)
      .where(eq(cartItems.userId, user.id))
      .all();

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

interface AddToCartRequest {
  title: string;
  description?: string;
  quantity?: number;
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateAndGetUser();
    if (error) return error;

    let body: AddToCartRequest;
    try {
      body = await request.json() as AddToCartRequest;
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { title, description, quantity = 1 } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (title.length > 50) {
      return NextResponse.json({ error: 'Title must be 50 characters or less' }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 });
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      return NextResponse.json({ error: 'Quantity must be a positive integer between 1 and 999' }, { status: 400 });
    }

    // Insert new cart item
    const result = await db
      .insert(cartItems)
      .values({
        userId: user.id,
        title,
        description,
        quantity,
      })
      .returning({ id: cartItems.id });

    const newItemId = result[0]?.id;

    if (newItemId === undefined) {
      console.error('Cart insert did not return an ID');
      return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
    }

    // Broadcast via WebSocket (non-blocking)
    broadcastItemAdded(
      user.id,
      {
        id: newItemId,
        title,
        description: description ?? null, // Normalize undefined to null
        quantity,
        unitPriceCents: null,
      },
      { userId: user.id, role: 'owner' }
    ).catch((err) => {
      console.error('Failed to broadcast cart item added:', {
        error: err instanceof Error ? err.message : String(err),
        userId: user.id,
        itemId: newItemId,
      });
    });

    return NextResponse.json({
      message: 'Item added to cart',
      itemId: newItemId,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE - Clear entire cart
export async function DELETE() {
  try {
    const { user, error } = await authenticateAndGetUser();
    if (error) return error;

    // Delete all cart items for user
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, user.id));

    // Broadcast via WebSocket (non-blocking)
    broadcastCartCleared(
      user.id,
      { userId: user.id, role: 'owner' }
    ).catch((error) => {
      console.error('Failed to broadcast cart cleared:', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id,
      });
    });

    return NextResponse.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
