import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { or, like, sql } from "drizzle-orm";
import { getCurrentUser, canManageUserCarts } from "@/lib/auth-helpers";

// GET - Search users by email or name (for internal employees)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check role permission
    const hasPermission = await canManageUserCarts();
    if (!hasPermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 20) : 20;

    if (!query || query.length < 2) {
      return NextResponse.json({
        users: [],
        message: "Query must be at least 2 characters"
      });
    }

    const searchPattern = `%${query}%`;

    const searchResults = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(
        or(
          like(users.email, searchPattern),
          like(users.displayName, searchPattern),
          like(users.firstName, searchPattern),
          like(users.lastName, searchPattern),
          sql`(${users.firstName} || ' ' || ${users.lastName}) LIKE ${searchPattern}`
        )
      )
      .limit(limit)
      .all();

    // Format results
    const formattedUsers = searchResults.map(user => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email,
      avatarUrl: user.avatarUrl,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
