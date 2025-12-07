import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";


// Online threshold: 60 seconds (user is online if active within last 60 seconds)
const ONLINE_THRESHOLD_SECONDS = 60;

// GET - Get presence status for specified users
export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const userIdsParam = searchParams.get('userIds');

		if (!userIdsParam) {
			return NextResponse.json({ error: "userIds parameter is required" }, { status: 400 });
		}

		// Parse comma-separated user IDs
		const userIds = userIdsParam
			.split(',')
			.map(id => parseInt(id.trim()))
			.filter(id => !isNaN(id));

		if (userIds.length === 0) {
			return NextResponse.json({ error: "No valid user IDs provided" }, { status: 400 });
		}

		// Limit to 100 users per request for performance
		if (userIds.length > 100) {
			return NextResponse.json({ error: "Maximum 100 users per request" }, { status: 400 });
		}

		// Fetch lastActiveAt for all requested users
		const usersData = await db
			.select({
				id: users.id,
				lastActiveAt: users.lastActiveAt,
			})
			.from(users)
			.where(inArray(users.id, userIds))
			.all();

		// Calculate current time for online status
		const now = Math.floor(Date.now() / 1000);

		// Build status map
		const statuses: Record<number, { isOnline: boolean; lastActiveAt: number | null }> = {};

		for (const user of usersData) {
			const isOnline = user.lastActiveAt !== null &&
				(now - user.lastActiveAt) < ONLINE_THRESHOLD_SECONDS;

			statuses[user.id] = {
				isOnline,
				lastActiveAt: user.lastActiveAt,
			};
		}

		// Include requested users that weren't found (mark as offline)
		for (const userId of userIds) {
			if (!(userId in statuses)) {
				statuses[userId] = {
					isOnline: false,
					lastActiveAt: null,
				};
			}
		}

		return NextResponse.json({ statuses });
	} catch (error) {
		console.error("Error fetching presence status:", error);
		return NextResponse.json({ error: "Failed to fetch presence status" }, { status: 500 });
	}
}
