import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { conversationParticipants, messages } from "@/server/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET - Get count of conversations with unread messages
export async function GET() {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Count distinct conversations where:
		// 1. User is a participant
		// 2. There are messages newer than lastReadAt
		// 3. Messages are not from the current user
		// 4. Messages are not deleted
		const result = await db
			.select({
				count: sql<number>`count(distinct ${conversationParticipants.conversationId})`,
			})
			.from(conversationParticipants)
			.innerJoin(
				messages,
				eq(messages.conversationId, conversationParticipants.conversationId)
			)
			.where(
				and(
					eq(conversationParticipants.userId, currentUser.id),
					sql`${messages.createdAt} > coalesce(${conversationParticipants.lastReadAt}, 0)`,
					ne(messages.senderId, currentUser.id),
					eq(messages.isDeleted, 0)
				)
			)
			.get();

		return NextResponse.json({
			count: result?.count ?? 0,
		});
	} catch (error) {
		console.error("Error getting unread count:", error);
		return NextResponse.json({ error: "Failed to get unread count" }, { status: 500 });
	}
}
