import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { cartItems, users } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';

// GET - Get cart item count for badge
// Returns 0 for unauthenticated users (silent fail for badge display)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    // Get user's database ID
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get();

    if (!user) {
      return NextResponse.json({ count: 0 });
    }

    // Count cart items
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(cartItems)
      .where(eq(cartItems.userId, user.id))
      .get();

    return NextResponse.json({ count: result?.count || 0 });
  } catch (error) {
    console.error('Error counting cart items:', error);
    return NextResponse.json({ count: 0 });
  }
}
