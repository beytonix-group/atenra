import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { userActivities, users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get the session to identify the user
    const session = await auth();
    
    // Parse request body
    const body = await request.json() as {
      action: string;
      info: string;
      userId?: number;
    };
    
    // Determine user ID - use session if available, otherwise use provided userId
    let userId: number | null = null;
    
    if (session?.user?.email) {
      // If user is logged in, find their ID from the database
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);
      
      if (user && user.length > 0) {
        userId = user[0].id;
      }
    } else if (body.userId) {
      // Use provided userId (for tracking before login)
      userId = body.userId;
    }
    
    // If we don't have a user ID, we can't track
    if (!userId) {
      console.log('No user ID found for tracking');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Insert the activity record directly using db
    await db.insert(userActivities).values({
      userId,
      action: body.action,
      info: body.info,
    });
    
    console.log(`Activity tracked: User ${userId} - ${body.action} - ${body.info}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json(
      { error: 'Failed to track activity' },
      { status: 500 }
    );
  }
}