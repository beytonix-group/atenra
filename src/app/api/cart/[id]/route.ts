import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { cartItems } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateAndGetUser } from '@/lib/cart-helpers';
import { broadcastItemUpdated, broadcastItemRemoved } from '@/lib/cart-broadcast';

interface UpdateCartItemRequest {
  quantity?: number;
  title?: string;
  description?: string;
}

// PATCH - Update cart item quantity or details
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateAndGetUser();
    if (error) return error;

    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    let body: UpdateCartItemRequest;
    try {
      body = await request.json() as UpdateCartItemRequest;
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { quantity, title, description } = body;

    // Validate title length if provided
    if (title !== undefined && title.length > 50) {
      return NextResponse.json({ error: 'Title must be 50 characters or less' }, { status: 400 });
    }

    // Validate description length if provided
    if (description !== undefined && description.length > 500) {
      return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 });
    }

    // Validate quantity if provided
    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        return NextResponse.json({ error: 'Quantity must be a positive integer between 1 and 999' }, { status: 400 });
      }
    }

    // Verify item belongs to user
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, itemId),
          eq(cartItems.userId, user.id)
        )
      )
      .get();

    if (!existingItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Build update object
    const updateData: Partial<{
      quantity: number;
      title: string;
      description: string;
      updatedAt: number;
    }> = {
      updatedAt: Math.floor(Date.now() / 1000),
    };

    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }

    if (title !== undefined) {
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    // Update the item
    await db
      .update(cartItems)
      .set(updateData)
      .where(eq(cartItems.id, itemId));

    // Broadcast via WebSocket (non-blocking)
    broadcastItemUpdated(
      user.id,
      {
        id: itemId,
        title: title ?? existingItem.title,
        description: description ?? existingItem.description,
        quantity: quantity ?? existingItem.quantity,
        unitPriceCents: existingItem.unitPriceCents,
      },
      { userId: user.id, role: 'owner' }
    ).catch((error) => {
      console.error('Failed to broadcast cart item update:', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id,
        itemId,
      });
    });

    return NextResponse.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateAndGetUser();
    if (error) return error;

    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    // Verify item belongs to user and delete
    const result = await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.id, itemId),
          eq(cartItems.userId, user.id)
        )
      )
      .returning({ id: cartItems.id });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Broadcast via WebSocket (non-blocking)
    broadcastItemRemoved(
      user.id,
      itemId,
      { userId: user.id, role: 'owner' }
    ).catch((error) => {
      console.error('Failed to broadcast cart item removal:', {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id,
        itemId,
      });
    });

    return NextResponse.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
