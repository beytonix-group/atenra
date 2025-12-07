import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { conversations, conversationParticipants, users } from "@/server/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { z } from "zod";


const addParticipantsSchema = z.object({
	userIds: z.array(z.number().int().positive()).min(1, "At least one user required"),
});

// POST - Add participants to a group conversation
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
			return NextResponse.json({ error: "Only admins can add participants" }, { status: 403 });
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

		// If it's not a group, convert it to a group
		if (conversation.isGroup !== 1) {
			await db
				.update(conversations)
				.set({ isGroup: 1 })
				.where(eq(conversations.id, conversationId));
		}

		const body = await request.json();
		const validatedData = addParticipantsSchema.parse(body);
		const { userIds } = validatedData;

		// Verify all users exist
		const existingUsers = await db
			.select({ id: users.id })
			.from(users)
			.where(inArray(users.id, userIds))
			.all();

		if (existingUsers.length !== userIds.length) {
			return NextResponse.json({ error: "One or more users not found" }, { status: 400 });
		}

		// Get existing participants
		const existingParticipants = await db
			.select({ userId: conversationParticipants.userId })
			.from(conversationParticipants)
			.where(eq(conversationParticipants.conversationId, conversationId))
			.all();

		const existingUserIds = existingParticipants.map(p => p.userId);

		// Filter out users already in conversation
		const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

		if (newUserIds.length === 0) {
			return NextResponse.json({ error: "All users are already participants" }, { status: 400 });
		}

		// Add new participants
		const participantValues = newUserIds.map(userId => ({
			conversationId,
			userId,
			isAdmin: 0,
		}));

		await db.insert(conversationParticipants).values(participantValues);

		// Update conversation's updatedAt
		await db
			.update(conversations)
			.set({ updatedAt: sql`(unixepoch())` })
			.where(eq(conversations.id, conversationId));

		// Return updated participant list
		const allParticipants = await db
			.select({
				id: users.id,
				displayName: users.displayName,
				firstName: users.firstName,
				lastName: users.lastName,
				avatarUrl: users.avatarUrl,
				isAdmin: conversationParticipants.isAdmin,
			})
			.from(conversationParticipants)
			.innerJoin(users, eq(conversationParticipants.userId, users.id))
			.where(eq(conversationParticipants.conversationId, conversationId))
			.all();

		return NextResponse.json({
			success: true,
			addedCount: newUserIds.length,
			participants: allParticipants.map(p => ({
				id: p.id,
				displayName: p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
				avatarUrl: p.avatarUrl,
				isAdmin: p.isAdmin === 1,
			})),
		});
	} catch (error) {
		console.error("Error adding participants:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid data", details: error.issues },
				{ status: 400 }
			);
		}

		return NextResponse.json({ error: "Failed to add participants" }, { status: 500 });
	}
}

// DELETE - Remove a participant from conversation (admin only)
export async function DELETE(
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
			return NextResponse.json({ error: "Only admins can remove participants" }, { status: 403 });
		}

		const body = await request.json() as { userId?: number };
		const userId = body.userId;

		if (!userId || typeof userId !== 'number') {
			return NextResponse.json({ error: "User ID is required" }, { status: 400 });
		}

		// Can't remove yourself if you're the only admin
		if (userId === currentUser.id) {
			const admins = await db
				.select()
				.from(conversationParticipants)
				.where(
					and(
						eq(conversationParticipants.conversationId, conversationId),
						eq(conversationParticipants.isAdmin, 1)
					)
				)
				.all();

			if (admins.length === 1) {
				return NextResponse.json({ error: "Cannot remove the only admin" }, { status: 400 });
			}
		}

		// Remove participant
		const deleted = await db
			.delete(conversationParticipants)
			.where(
				and(
					eq(conversationParticipants.conversationId, conversationId),
					eq(conversationParticipants.userId, userId)
				)
			)
			.returning()
			.get();

		if (!deleted) {
			return NextResponse.json({ error: "Participant not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error removing participant:", error);
		return NextResponse.json({ error: "Failed to remove participant" }, { status: 500 });
	}
}
