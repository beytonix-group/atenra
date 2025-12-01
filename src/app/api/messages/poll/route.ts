import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { conversations, conversationParticipants, messages, users } from "@/server/db/schema";
import { eq, and, desc, sql, inArray, gt } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

export const runtime = "edge";

// GET - Poll for updates since a given timestamp
export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const sinceParam = searchParams.get('since');
		const since = sinceParam ? parseInt(sinceParam) : Math.floor(Date.now() / 1000) - 60; // Default: last minute

		// Get all conversation IDs where user is a participant
		const userParticipations = await db
			.select({
				conversationId: conversationParticipants.conversationId,
				lastReadAt: conversationParticipants.lastReadAt,
			})
			.from(conversationParticipants)
			.where(eq(conversationParticipants.userId, currentUser.id))
			.all();

		if (userParticipations.length === 0) {
			return NextResponse.json({
				conversations: [],
				serverTime: Math.floor(Date.now() / 1000),
			});
		}

		const conversationIds = userParticipations.map(p => p.conversationId);
		const lastReadMap = new Map(userParticipations.map(p => [p.conversationId, p.lastReadAt || 0]));

		// Get conversations with updates since 'since' timestamp
		const updatedConversations = await db
			.select({
				id: conversations.id,
				updatedAt: conversations.updatedAt,
			})
			.from(conversations)
			.where(
				and(
					inArray(conversations.id, conversationIds),
					gt(conversations.updatedAt, since)
				)
			)
			.all();

		// For each updated conversation, get new message count and last message
		const conversationUpdates = await Promise.all(
			updatedConversations.map(async (conv) => {
				const lastReadAt = lastReadMap.get(conv.id) || 0;

				// Count new messages (not from current user)
				const newMessageCount = await db
					.select({ count: sql<number>`count(*)` })
					.from(messages)
					.where(
						and(
							eq(messages.conversationId, conv.id),
							eq(messages.isDeleted, 0),
							sql`${messages.createdAt} > ${lastReadAt}`,
							sql`${messages.senderId} != ${currentUser.id}`
						)
					)
					.get();

				// Get last message
				const lastMessage = await db
					.select({
						id: messages.id,
						content: messages.content,
						createdAt: messages.createdAt,
						senderDisplayName: users.displayName,
						senderFirstName: users.firstName,
						senderLastName: users.lastName,
					})
					.from(messages)
					.innerJoin(users, eq(messages.senderId, users.id))
					.where(
						and(
							eq(messages.conversationId, conv.id),
							eq(messages.isDeleted, 0)
						)
					)
					.orderBy(desc(messages.createdAt))
					.limit(1)
					.get();

				return {
					id: conv.id,
					newMessageCount: newMessageCount?.count || 0,
					lastMessage: lastMessage ? {
						id: lastMessage.id,
						content: lastMessage.content,
						createdAt: lastMessage.createdAt,
						senderName: lastMessage.senderDisplayName ||
							`${lastMessage.senderFirstName || ''} ${lastMessage.senderLastName || ''}`.trim() ||
							'Unknown',
					} : null,
				};
			})
		);

		// Filter to only include conversations with actual new messages or recent updates
		const relevantUpdates = conversationUpdates.filter(c => c.newMessageCount > 0 || c.lastMessage);

		return NextResponse.json({
			conversations: relevantUpdates,
			serverTime: Math.floor(Date.now() / 1000),
		});
	} catch (error) {
		console.error("Error polling for updates:", error);
		return NextResponse.json({ error: "Failed to poll for updates" }, { status: 500 });
	}
}
