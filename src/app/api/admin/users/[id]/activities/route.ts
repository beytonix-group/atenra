import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from "@/lib/auth/permissions";
import { db } from '@/server/db';
import { userActivities, users } from '@/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { ROLES } from '@/lib/auth/roles';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure user is super_admin
    await requireRole(ROLES.SUPER_ADMIN);
    
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    // Fetch user details
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .all();
    
    const user = userResult[0];
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Fetch activities for this specific user
    const activities = await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt))
      .limit(1000)
      .all();
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      activities: activities.map((activity: any) => ({
        id: activity.id,
        action: activity.action,
        info: activity.info,
        createdAt: activity.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch user activities' },
      { status: 500 }
    );
  }
}