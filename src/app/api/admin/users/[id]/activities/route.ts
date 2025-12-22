import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { userActivities, users } from "@/server/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { trackActivity } from "@/lib/server-activity-tracker";
import { auth } from "@/server/auth";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is super admin
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const limitParam = parseInt(searchParams.get("limit") || "100", 10);
    const offsetParam = parseInt(searchParams.get("offset") || "0", 10);
    const limit = Math.min(Math.max(isNaN(limitParam) ? 100 : limitParam, 1), 500);
    const offset = isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;
    const action = searchParams.get("action");
    const since = searchParams.get("since"); // Unix timestamp

    // Build where conditions
    const whereConditions = [eq(userActivities.userId, userId)];
    
    if (action) {
      whereConditions.push(eq(userActivities.activityType, action));
    }
    
    if (since) {
      const sinceTimestamp = parseInt(since);
      if (!isNaN(sinceTimestamp)) {
        whereConditions.push(gte(userActivities.createdAt, sinceTimestamp));
      }
    }

    // Fetch user details
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch activities
    const activities = await db
      .select()
      .from(userActivities)
      .where(and(...whereConditions))
      .orderBy(desc(userActivities.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userActivities)
      .where(and(...whereConditions))
      .get();

    const totalCount = countResult?.count ?? 0;

    // Parse metadata field for each activity
    const formattedActivities = activities.map(activity => {
      let parsedMetadata = {};
      try {
        if (activity.metadata) {
          parsedMetadata = JSON.parse(activity.metadata);
        }
      } catch {
        // If metadata is not valid JSON, treat it as a string
        parsedMetadata = { raw: activity.metadata };
      }

      return {
        id: activity.id,
        action: activity.activityType,
        timestamp: activity.createdAt,
        info: {
          message: activity.description,
          ...parsedMetadata
        },
      };
    });

    // Track admin viewing user activities
    const session = await auth();
    if (session?.user?.id) {
      await trackActivity({
        authUserId: session.user.id,
        action: "admin_view_user_activities",
        info: {
          targetUserId: userId,
          targetUserEmail: user.email,
          activitiesCount: formattedActivities.length,
        }
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      },
      activities: formattedActivities,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      }
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}