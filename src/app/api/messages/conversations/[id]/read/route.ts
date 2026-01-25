import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { conversationParticipants, messages } from "@/server/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { broadcastUnreadCountChange } from "@/lib/user-broadcast";


// POST - Mark conversation as read
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const conversationId = parseInt(id);
		if (isNaN(conversationId)) {
			return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
		}

		// Update lastReadAt for current user
		const result = await db
			.update(conversationParticipants)
			.set({ lastReadAt: sql`(unixepoch())` })
			.where(
				and(
					eq(conversationParticipants.conversationId, conversationId),
					eq(conversationParticipants.userId, currentUser.id)
				)
			)
			.returning()
			.get();

		if (!result) {
			return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
		}

		// Broadcast updated unread count to the current user via User WebSocket
		try {
			// Calculate new unread count for this user
			const unreadResult = await db
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

			const unreadCount = unreadResult?.count ?? 0;
			await broadcastUnreadCountChange(currentUser.id, unreadCount);
		} catch (unreadBroadcastError) {
			console.error('Failed to broadcast unread count on mark read:', {
				error: unreadBroadcastError instanceof Error ? unreadBroadcastError.message : String(unreadBroadcastError),
				conversationId,
				userId: currentUser.id,
			});
		}

		return NextResponse.json({ success: true, lastReadAt: result.lastReadAt });
	} catch (error) {
		console.error("Error marking conversation as read:", error);
		return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
	}
}
