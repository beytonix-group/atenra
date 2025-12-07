import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, like, or, and, ne, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";


// GET - Search users to start a conversation with
export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q')?.trim().toLowerCase() || '';
		const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

		if (query.length < 2) {
			return NextResponse.json({ users: [] });
		}

		// Search by email, displayName, firstName, lastName
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
				and(
					ne(users.id, currentUser.id), // Exclude current user
					eq(users.status, 'active'), // Only active users
					or(
						like(sql`lower(${users.email})`, searchPattern),
						like(sql`lower(${users.displayName})`, searchPattern),
						like(sql`lower(${users.firstName})`, searchPattern),
						like(sql`lower(${users.lastName})`, searchPattern)
					)
				)
			)
			.limit(limit)
			.all();

		const formattedUsers = searchResults.map(u => ({
			id: u.id,
			email: u.email,
			displayName: u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
			avatarUrl: u.avatarUrl,
		}));

		return NextResponse.json({ users: formattedUsers });
	} catch (error) {
		console.error("Error searching users:", error);
		return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
	}
}
