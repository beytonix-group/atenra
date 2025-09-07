import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { userActivities, users, userRoles, roles } from '@/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { ROLES } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is super admin
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is super admin
    const adminUser = await db
      .select({ roleName: roles.name })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.email, session.user.email))
      .limit(1);
    
    if (!adminUser || adminUser.length === 0 || adminUser[0].roleName !== ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // Fetch activities with user information
    const activities = await db
      .select({
        id: userActivities.id,
        userId: userActivities.userId,
        userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        userEmail: users.email,
        action: userActivities.action,
        info: userActivities.info,
        createdAt: userActivities.createdAt,
      })
      .from(userActivities)
      .leftJoin(users, eq(userActivities.userId, users.id))
      .orderBy(desc(userActivities.createdAt))
      .limit(500); // Limit to last 500 activities
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}