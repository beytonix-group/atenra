import { db } from "@/server/db";
import { userActivities, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

interface TrackingOptions {
  userId?: number;
  authUserId?: string;
  action: string;
  info?: string | Record<string, any>;
  request?: Request;
}

/**
 * Server-side activity tracking helper
 * Use this in API routes to track user activities
 */
export async function trackActivity(options: TrackingOptions): Promise<void> {
  try {
    let userId = options.userId;
    
    // If we have authUserId but not userId, look it up
    if (!userId && options.authUserId) {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.authUserId, options.authUserId))
        .get();
      userId = user?.id;
    }
    
    // Skip if no user ID
    if (!userId) return;
    
    // Build metadata from request if provided
    const metadata: Record<string, any> = {};
    if (options.request) {
      const url = new URL(options.request.url);
      metadata.path = url.pathname;
      metadata.method = options.request.method;
      metadata.userAgent = options.request.headers.get("user-agent") || undefined;
      
      // Add query params if they exist (sanitized)
      const searchParams = Object.fromEntries(url.searchParams.entries());
      if (Object.keys(searchParams).length > 0) {
        // Remove sensitive params
        const sanitized = Object.keys(searchParams).reduce((acc, key) => {
          if (!['password', 'token', 'secret', 'key', 'auth'].some(sensitive => 
            key.toLowerCase().includes(sensitive))) {
            acc[key] = searchParams[key];
          }
          return acc;
        }, {} as Record<string, string>);
        
        if (Object.keys(sanitized).length > 0) {
          metadata.query = sanitized;
        }
      }
    }
    
    // Combine info and metadata
    let finalInfo: string;
    if (typeof options.info === 'string') {
      finalInfo = JSON.stringify({ message: options.info, ...metadata });
    } else if (options.info) {
      finalInfo = JSON.stringify({ ...options.info, ...metadata });
    } else {
      finalInfo = JSON.stringify(metadata);
    }
    
    // Insert the activity using correct column names
    await db.insert(userActivities).values({
      userId,
      activityType: options.action.slice(0, 64),
      description: typeof options.info === 'string' ? options.info : JSON.stringify(options.info),
      metadata: finalInfo.slice(0, 4000), // Limit metadata size
      createdAt: Math.floor(Date.now() / 1000),
    });
  } catch (error) {
    // Log error but don't throw - tracking should never break the app
    console.error("Server activity tracking error:", error);
  }
}

/**
 * Convenience function to track API calls
 */
export async function trackApiCall(
  request: Request,
  response: { status: number; message?: string },
  authUserId?: string
): Promise<void> {
  const url = new URL(request.url);
  await trackActivity({
    authUserId,
    action: "api_call",
    info: {
      endpoint: url.pathname,
      method: request.method,
      statusCode: response.status,
      message: response.message,
    },
    request,
  });
}

/**
 * Higher-order function to wrap API route handlers with automatic tracking
 */
export function withActivityTracking<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  getAction?: (request: Request) => string
): T {
  return (async (...args: Parameters<T>) => {
    const request = args[0] as Request;
    const startTime = performance.now();
    
    try {
      const response = await handler(...args);
      const duration = Math.round(performance.now() - startTime);
      
      // Get auth session if possible (you may need to adjust this based on your auth setup)
      const authModule = await import("@/server/auth");
      const session = await authModule.auth();
      
      // Track the activity
      await trackActivity({
        authUserId: session?.user?.id,
        action: getAction ? getAction(request) : "api_call",
        info: {
          endpoint: new URL(request.url).pathname,
          method: request.method,
          statusCode: response.status,
          duration: `${duration}ms`,
        },
        request,
      });
      
      return response;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      
      // Track the error
      const authModule = await import("@/server/auth");
      const session = await authModule.auth();
      
      await trackActivity({
        authUserId: session?.user?.id,
        action: getAction ? getAction(request) : "api_error",
        info: {
          endpoint: new URL(request.url).pathname,
          method: request.method,
          error: error instanceof Error ? error.message : "Unknown error",
          duration: `${duration}ms`,
        },
        request,
      });
      
      throw error;
    }
  }) as T;
}