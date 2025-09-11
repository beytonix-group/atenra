import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { userActivities, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

interface ActivityEvent {
  action: string;
  info?: string | null;
  path?: string;
  method?: string;
  statusCode?: number;
  ts?: number;
  userId?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Try to get the session for logged-in users
    const session = await auth();
    let sessionUserId: number | null = null;
    
    if (session?.user?.id) {
      // Get the database user ID from auth user ID
      const user = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.authUserId, session.user.id))
        .get();
      
      sessionUserId = user?.id || null;
    }
    
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response("Bad Request", { status: 400 });
    }

    const body = await request.json() as { events?: unknown };
    const { events } = body;
    
    if (!Array.isArray(events) || events.length === 0) {
      // Return 204 No Content for empty events (success but no action)
      return new Response(null, { status: 204 });
    }

    // Process events in batch (max 100 per request)
    const MAX_BATCH = 100;
    const batch = events.slice(0, MAX_BATCH) as ActivityEvent[];
    
    // Process and insert activities one by one
    let insertCount = 0;
    for (const event of batch) {
      // Always use session user ID if available (most reliable)
      // Fall back to provided userId only if no session
      const userId = sessionUserId || event.userId || null;
      
      // Skip if no user ID - we can't track without a user
      if (!userId) {
        continue;
      }
      
      // Sanitize and validate data
      const action = String(event.action || "").slice(0, 64);
      if (!action) continue;
      
      // Build metadata object
      const metadata: Record<string, any> = {};
      if (event.path) metadata.path = String(event.path).slice(0, 255);
      if (event.method) metadata.method = String(event.method).slice(0, 10);
      if (event.statusCode) metadata.statusCode = Number(event.statusCode);
      if (event.ts) metadata.clientTimestamp = Number(event.ts);
      
      // Combine info and metadata
      const info = event.info ? 
        JSON.stringify({ 
          message: String(event.info).slice(0, 1000),
          ...metadata 
        }) : 
        JSON.stringify(metadata);
      
      try {
        // Insert the activity using the correct column names
        await db.insert(userActivities).values({
          userId,
          activityType: action,
          description: event.path || info || action, // Use path as description for page visits
          metadata: info, // Store additional data in metadata
          createdAt: Math.floor(Date.now() / 1000), // Unix timestamp
        });
        insertCount++;
      } catch (insertError) {
        console.error(`Failed to insert activity: ${action}`, insertError);
      }
    }
    
    if (insertCount > 0) {
      console.log(`Successfully tracked ${insertCount} activities for user ${sessionUserId}`);
    }
    
    // Return 204 No Content (success, no response body needed)
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Activity tracking error:", error);
    // Don't leak error details to client
    // Return 200 OK to prevent client retries that could cause jank
    return new Response("OK", { status: 200 });
  }
}