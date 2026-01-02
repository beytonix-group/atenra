import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

type AuthSuccess = { user: { id: number }; error?: never };
type AuthError = { user?: never; error: NextResponse };
type AuthResult = AuthSuccess | AuthError;

/**
 * Authenticate the current user and get their database ID.
 * Returns either the user object or an error response.
 */
export async function authenticateAndGetUser(): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.authUserId, session.user.id))
    .get();

  if (!user) {
    return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) };
  }

  return { user };
}
