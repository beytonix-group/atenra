import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { conversations, conversationParticipants, users } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { z } from "zod";


const updateConversationSchema = z.object({
	title: z.string().max(100).optional(),
});

// GET - Get conversation details
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

		// Get conversation
		const conversation = await db
			.select()
			.from(conversations)
			.where(eq(conversations.id, conversationId))
			.get();

		if (!conversation) {
			return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
		}

		// Get participants
		const participants = await db
			.select({
				id: users.id,
				displayName: users.displayName,
				firstName: users.firstName,
				lastName: users.lastName,
				email: users.email,
				avatarUrl: users.avatarUrl,
				isAdmin: conversationParticipants.isAdmin,
				joinedAt: conversationParticipants.joinedAt,
			})
			.from(conversationParticipants)
			.innerJoin(users, eq(conversationParticipants.userId, users.id))
			.where(eq(conversationParticipants.conversationId, conversationId))
			.all();

		return NextResponse.json({
			conversation: {
				id: conversation.id,
				title: conversation.title,
				isGroup: conversation.isGroup === 1,
				createdAt: conversation.createdAt,
				updatedAt: conversation.updatedAt,
				participants: participants.map(p => ({
					id: p.id,
					displayName: p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email,
					avatarUrl: p.avatarUrl,
					isAdmin: p.isAdmin === 1,
					joinedAt: p.joinedAt,
				})),
			},
		});
	} catch (error) {
		console.error("Error fetching conversation:", error);
		return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
	}
}

// PATCH - Update conversation (title only for now)
export async function PATCH(
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

		// Check if user is a participant and admin
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

		if (participation.isAdmin !== 1) {
			return NextResponse.json({ error: "Only admins can update conversation" }, { status: 403 });
		}

		const body = await request.json();
		const validatedData = updateConversationSchema.parse(body);

		if (validatedData.title !== undefined) {
			await db
				.update(conversations)
				.set({ title: validatedData.title })
				.where(eq(conversations.id, conversationId));
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating conversation:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
	}
}
