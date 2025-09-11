import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userActivities } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "edge";

export async function GET() {
  try {
    // Get current session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "Not authenticated",
        session: null 
      });
    }
    
    // Get database user
    const dbUser = session.user.id ? await db
      .select()
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get() : null;
    
    // Get recent activities for this user
    let recentActivities: any[] = [];
    if (dbUser) {
      recentActivities = await db
        .select()
        .from(userActivities)
        .where(eq(userActivities.userId, dbUser.id))
        .orderBy(desc(userActivities.createdAt))
        .limit(10)
        .all();
    }
    
    return NextResponse.json({
      session: {
        email: session.user.email,
        authUserId: session.user.id,
        name: session.user.name
      },
      dbUser: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        authUserId: dbUser.authUserId,
        createdAt: dbUser.createdAt
      } : null,
      activityCount: recentActivities.length,
      recentActivities: recentActivities.map(a => ({
        id: a.id,
        activityType: a.activityType,
        description: a.description,
        metadata: a.metadata,
        createdAt: a.createdAt
      })),
      debug: {
        sessionAuthId: session.user.id,
        dbAuthId: dbUser?.authUserId,
        match: session.user.id === dbUser?.authUserId
      }
    });
  } catch (error) {
    console.error("Debug tracking error:", error);
    return NextResponse.json({ 
      error: "Internal error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}