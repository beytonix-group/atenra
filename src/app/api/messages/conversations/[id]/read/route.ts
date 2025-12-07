import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { conversationParticipants } from "@/server/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";


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

		return NextResponse.json({ success: true, lastReadAt: result.lastReadAt });
	} catch (error) {
		console.error("Error marking conversation as read:", error);
		return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
	}
}
