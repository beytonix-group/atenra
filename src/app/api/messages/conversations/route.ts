import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { conversations, conversationParticipants, messages, users } from "@/server/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { z } from "zod";


const createConversationSchema = z.object({
	participantIds: z.array(z.number().int().positive()).min(1, "At least one participant required"),
	title: z.string().max(100).optional(),
	isGroup: z.boolean().optional(),
	initialMessage: z.string().max(10000).optional(),
});

// GET - List all conversations for current user
export async function GET(_request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get all conversation IDs where user is a participant
		const userParticipations = await db
			.select({ conversationId: conversationParticipants.conversationId })
			.from(conversationParticipants)
			.where(eq(conversationParticipants.userId, currentUser.id))
			.all();

		if (userParticipations.length === 0) {
			return NextResponse.json({ conversations: [] });
		}

		const conversationIds = userParticipations.map(p => p.conversationId);

		// Get conversations
		const conversationList = await db
			.select({
				id: conversations.id,
				title: conversations.title,
				isGroup: conversations.isGroup,
				createdAt: conversations.createdAt,
				updatedAt: conversations.updatedAt,
			})
			.from(conversations)
			.where(inArray(conversations.id, conversationIds))
			.orderBy(desc(conversations.updatedAt))
			.all();

		// Batch query 1: All participants for all conversations
		const allParticipants = await db
			.select({
				conversationId: conversationParticipants.conversationId,
				id: users.id,
				displayName: users.displayName,
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				avatarUrl: users.avatarUrl,
			})
			.from(conversationParticipants)
			.innerJoin(users, eq(conversationParticipants.userId, users.id))
			.where(inArray(conversationParticipants.conversationId, conversationIds))
			.all();

		// Batch query 2: Current user's lastReadAt for all conversations
		const userParticipantData = await db
			.select({
				conversationId: conversationParticipants.conversationId,
				lastReadAt: conversationParticipants.lastReadAt,
			})
			.from(conversationParticipants)
			.where(
				and(
					inArray(conversationParticipants.conversationId, conversationIds),
					eq(conversationParticipants.userId, currentUser.id)
				)
			)
			.all();

		// Batch query 3: Last message for each conversation using a subquery
		const lastMessages = await db
			.select({
				conversationId: messages.conversationId,
				id: messages.id,
				content: messages.content,
				createdAt: messages.createdAt,
				senderId: messages.senderId,
				senderDisplayName: users.displayName,
				senderFirstName: users.firstName,
				senderLastName: users.lastName,
			})
			.from(messages)
			.innerJoin(users, eq(messages.senderId, users.id))
			.where(
				and(
					inArray(messages.conversationId, conversationIds),
					eq(messages.isDeleted, 0),
					sql`${messages.id} = (
						SELECT MAX(m2.id) FROM messages m2
						WHERE m2.conversation_id = ${messages.conversationId}
						AND m2.is_deleted = 0
					)`
				)
			)
			.all();

		// Build lastReadAt lookup for unread counting
		const lastReadAtMap = new Map(userParticipantData.map(p => [p.conversationId, p.lastReadAt || 0]));

		// Build lookup maps for O(1) access
		const participantsByConversation = new Map<number, typeof allParticipants>();
		for (const p of allParticipants) {
			if (!participantsByConversation.has(p.conversationId)) {
				participantsByConversation.set(p.conversationId, []);
			}
			participantsByConversation.get(p.conversationId)!.push(p);
		}

		const lastMessageByConversation = new Map(lastMessages.map(m => [m.conversationId, m]));

		// For accurate unread count, we need to filter by lastReadAt per conversation
		const unreadCountByConversation = new Map<number, number>();

		// Initialize all conversations with 0 unread count
		for (const convId of conversationIds) {
			unreadCountByConversation.set(convId, 0);
		}

		// Get actual unread counts in batches (we need to check createdAt > lastReadAt per conversation)
		// Since each conversation has different lastReadAt, we need individual queries
		// But we can do them in parallel Promise.all
		await Promise.all(
			conversationIds.map(async (convId) => {
				const lastReadAt = lastReadAtMap.get(convId) || 0;
				const unreadResult = await db
					.select({ count: sql<number>`count(*)` })
					.from(messages)
					.where(
						and(
							eq(messages.conversationId, convId),
							eq(messages.isDeleted, 0),
							sql`${messages.createdAt} > ${lastReadAt}`,
							sql`${messages.senderId} != ${currentUser.id}`
						)
					)
					.get();
				unreadCountByConversation.set(convId, unreadResult?.count || 0);
			})
		);

		// Aggregate results in JavaScript
		const conversationsWithDetails = conversationList.map((conv) => {
			const participants = participantsByConversation.get(conv.id) || [];
			const lastMessage = lastMessageByConversation.get(conv.id);
			const unreadCount = unreadCountByConversation.get(conv.id) || 0;

			return {
				id: conv.id,
				title: conv.title,
				isGroup: conv.isGroup === 1,
				updatedAt: conv.updatedAt,
				participants: participants.map(p => ({
					id: p.id,
					displayName: p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
					avatarUrl: p.avatarUrl,
				})),
				lastMessage: lastMessage ? {
					id: lastMessage.id,
					content: lastMessage.content,
					createdAt: lastMessage.createdAt,
					senderName: lastMessage.senderDisplayName ||
						`${lastMessage.senderFirstName || ''} ${lastMessage.senderLastName || ''}`.trim() ||
						'Unknown',
				} : null,
				unreadCount,
			};
		});

		return NextResponse.json({ conversations: conversationsWithDetails });
	} catch (error) {
		console.error("Error fetching conversations:", error);
		return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
	}
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = createConversationSchema.parse(body);
		const { participantIds, title, isGroup, initialMessage } = validatedData;

		// Include current user in participants if not already included
		const allParticipantIds = Array.from(new Set([currentUser.id, ...participantIds]));

		// Verify all participants exist
		const existingUsers = await db
			.select({ id: users.id })
			.from(users)
			.where(inArray(users.id, allParticipantIds))
			.all();

		if (existingUsers.length !== allParticipantIds.length) {
			return NextResponse.json({ error: "One or more participants not found" }, { status: 400 });
		}

		// For 1-on-1 conversations, check if conversation already exists
		if (!isGroup && allParticipantIds.length === 2) {
			const existingConversation = await findExisting1on1Conversation(
				currentUser.id,
				participantIds[0]
			);
			if (existingConversation) {
				return NextResponse.json({
					conversation: existingConversation,
					existing: true
				});
			}
		}

		// Create conversation
		const isGroupConversation = isGroup || allParticipantIds.length > 2 ? 1 : 0;
		const newConversation = await db
			.insert(conversations)
			.values({
				title: title || null,
				isGroup: isGroupConversation,
				createdByUserId: currentUser.id,
			})
			.returning()
			.get();

		if (!newConversation) {
			return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
		}

		// Add participants
		const participantValues = allParticipantIds.map(userId => ({
			conversationId: newConversation.id,
			userId,
			isAdmin: userId === currentUser.id ? 1 : 0,
		}));

		await db.insert(conversationParticipants).values(participantValues);

		// Send initial message if provided
		if (initialMessage) {
			await db.insert(messages).values({
				conversationId: newConversation.id,
				senderId: currentUser.id,
				content: initialMessage,
				contentType: 'html',
			});

			// Update conversation's updatedAt
			await db
				.update(conversations)
				.set({ updatedAt: sql`(unixepoch())` })
				.where(eq(conversations.id, newConversation.id));
		}

		// Return full conversation details
		const participants = await db
			.select({
				id: users.id,
				displayName: users.displayName,
				firstName: users.firstName,
				lastName: users.lastName,
				avatarUrl: users.avatarUrl,
			})
			.from(conversationParticipants)
			.innerJoin(users, eq(conversationParticipants.userId, users.id))
			.where(eq(conversationParticipants.conversationId, newConversation.id))
			.all();

		return NextResponse.json({
			conversation: {
				id: newConversation.id,
				title: newConversation.title,
				isGroup: newConversation.isGroup === 1,
				createdAt: newConversation.createdAt,
				updatedAt: newConversation.updatedAt,
				participants: participants.map(p => ({
					id: p.id,
					displayName: p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
					avatarUrl: p.avatarUrl,
				})),
			},
			existing: false,
		});
	} catch (error) {
		console.error("Error creating conversation:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
	}
}

// Helper function to find existing 1-on-1 conversation
async function findExisting1on1Conversation(userId1: number, userId2: number) {
	// Find conversations where both users are participants and it's not a group
	const user1Conversations = await db
		.select({ conversationId: conversationParticipants.conversationId })
		.from(conversationParticipants)
		.innerJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
		.where(
			and(
				eq(conversationParticipants.userId, userId1),
				eq(conversations.isGroup, 0)
			)
		)
		.all();

	for (const { conversationId } of user1Conversations) {
		const participants = await db
			.select({ userId: conversationParticipants.userId })
			.from(conversationParticipants)
			.where(eq(conversationParticipants.conversationId, conversationId))
			.all();

		const participantIds = participants.map(p => p.userId);
		if (participantIds.length === 2 && participantIds.includes(userId1) && participantIds.includes(userId2)) {
			// Found existing conversation
			const conv = await db
				.select()
				.from(conversations)
				.where(eq(conversations.id, conversationId))
				.get();

			if (conv) {
				const participantDetails = await db
					.select({
						id: users.id,
						displayName: users.displayName,
						firstName: users.firstName,
						lastName: users.lastName,
						avatarUrl: users.avatarUrl,
					})
					.from(conversationParticipants)
					.innerJoin(users, eq(conversationParticipants.userId, users.id))
					.where(eq(conversationParticipants.conversationId, conversationId))
					.all();

				return {
					id: conv.id,
					title: conv.title,
					isGroup: conv.isGroup === 1,
					createdAt: conv.createdAt,
					updatedAt: conv.updatedAt,
					participants: participantDetails.map(p => ({
						id: p.id,
						displayName: p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
						avatarUrl: p.avatarUrl,
					})),
				};
			}
		}
	}

	return null;
}
