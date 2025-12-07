import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";


// POST - Send heartbeat to update user's last active timestamp
export async function POST() {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Update lastActiveAt to current unix timestamp
		await db
			.update(users)
			.set({ lastActiveAt: sql`(unixepoch())` })
			.where(eq(users.id, currentUser.id));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating presence:", error);
		return NextResponse.json({ error: "Failed to update presence" }, { status: 500 });
	}
}
