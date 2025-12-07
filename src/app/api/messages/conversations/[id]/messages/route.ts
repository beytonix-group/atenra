import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { conversations, conversationParticipants, messages, users } from "@/server/db/schema";
import { eq, and, desc, lt, gt, asc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { z } from "zod";


const sendMessageSchema = z.object({
	content: z.string().min(1).max(10000),
	contentType: z.enum(['html', 'json']).optional().default('html'),
});

// GET - Get messages for a conversation (with pagination)
export async function GET(
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

		// Check if user is a participant
		const participation = await db
			.select()
			.from(conversationParticipants)
			.where(
				and(
					eq(conversationParticipants.conversationId, conversationId),
					eq(conversationParticipants.userId, currentUser.id)
				)
			)
			.get();

		if (!participation) {
			return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
		}

		// Get pagination params
		const { searchParams } = new URL(request.url);
		const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
		const beforeId = searchParams.get('before') ? parseInt(searchParams.get('before')!) : null;
		const afterId = searchParams.get('after') ? parseInt(searchParams.get('after')!) : null;

		// Build query - handle "after" (new messages) vs "before" (older messages)
		let whereClause;
		if (afterId) {
			// Fetching new messages after a specific ID
			whereClause = and(
				eq(messages.conversationId, conversationId),
				gt(messages.id, afterId)
			);
		} else if (beforeId) {
			// Fetching older messages before a specific ID
			whereClause = and(
				eq(messages.conversationId, conversationId),
				lt(messages.id, beforeId)
			);
		} else {
			whereClause = eq(messages.conversationId, conversationId);
		}

		let messagesQuery = db
			.select({
				id: messages.id,
				content: messages.content,
				contentType: messages.contentType,
				createdAt: messages.createdAt,
				editedAt: messages.editedAt,
				isDeleted: messages.isDeleted,
				senderId: messages.senderId,
				senderDisplayName: users.displayName,
				senderFirstName: users.firstName,
				senderLastName: users.lastName,
				senderAvatarUrl: users.avatarUrl,
			})
			.from(messages)
			.innerJoin(users, eq(messages.senderId, users.id))
			.where(whereClause)
			.orderBy(afterId ? asc(messages.id) : desc(messages.createdAt))
			.limit(limit);

		const messageList = await messagesQuery.all();

		// Group messages by date for frontend
		const formattedMessages = messageList.map(m => ({
			id: m.id,
			content: m.isDeleted === 1 ? '' : m.content,
			contentType: m.contentType,
			createdAt: m.createdAt,
			editedAt: m.editedAt,
			isDeleted: m.isDeleted === 1,
			sender: {
				id: m.senderId,
				displayName: m.senderDisplayName ||
					`${m.senderFirstName || ''} ${m.senderLastName || ''}`.trim() ||
					'Unknown',
				avatarUrl: m.senderAvatarUrl,
			},
			isOwn: m.senderId === currentUser.id,
		}));

		// Check if there are more messages
		const hasMore = messageList.length === limit;

		// For "after" queries, messages are already in chronological order
		// For "before" queries, we need to reverse
		const sortedMessages = afterId ? formattedMessages : formattedMessages.reverse();

		return NextResponse.json({
			messages: sortedMessages,
			hasMore,
			oldestId: messageList.length > 0 ? messageList[messageList.length - 1].id : null,
		});
	} catch (error) {
		console.error("Error fetching messages:", error);
		return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
	}
}

// POST - Send a message
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

		// Check if user is a participant
		const participation = await db
			.select()
			.from(conversationParticipants)
			.where(
				and(
					eq(conversationParticipants.conversationId, conversationId),
					eq(conversationParticipants.userId, currentUser.id)
				)
			)
			.get();

		if (!participation) {
			return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
		}

		const body = await request.json();
		const validatedData = sendMessageSchema.parse(body);

		// Create message
		const newMessage = await db
			.insert(messages)
			.values({
				conversationId,
				senderId: currentUser.id,
				content: validatedData.content,
				contentType: validatedData.contentType,
			})
			.returning()
			.get();

		if (!newMessage) {
			return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
		}

		// Update conversation's updatedAt
		await db
			.update(conversations)
			.set({ updatedAt: sql`(unixepoch())` })
			.where(eq(conversations.id, conversationId));

		// Update sender's lastReadAt
		await db
			.update(conversationParticipants)
			.set({ lastReadAt: sql`(unixepoch())` })
			.where(
				and(
					eq(conversationParticipants.conversationId, conversationId),
					eq(conversationParticipants.userId, currentUser.id)
				)
			);

		return NextResponse.json({
			message: {
				id: newMessage.id,
				content: newMessage.content,
				contentType: newMessage.contentType,
				createdAt: newMessage.createdAt,
				editedAt: newMessage.editedAt,
				isDeleted: false,
				sender: {
					id: currentUser.id,
					displayName: currentUser.displayName ||
						`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
						currentUser.email,
					avatarUrl: currentUser.avatarUrl,
				},
				isOwn: true,
			},
		});
	} catch (error) {
		console.error("Error sending message:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
	}
}
