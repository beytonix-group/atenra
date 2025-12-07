import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";


export async function POST(request: NextRequest) {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const body: unknown = await request.json();

		if (!body || typeof body !== 'object' || !('email' in body)) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		const { email } = body as { email: string };

		if (!email || typeof email !== "string") {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Check if user with email exists
		const existingUser = await db
			.select({
				id: users.id,
				email: users.email,
				displayName: users.displayName,
				firstName: users.firstName,
				lastName: users.lastName,
			})
			.from(users)
			.where(eq(users.email, email.toLowerCase()))
			.get();

		if (existingUser) {
			return NextResponse.json({
				exists: true,
				user: existingUser,
			});
		}

		return NextResponse.json({
			exists: false,
		});
	} catch (error) {
		console.error("Error checking email:", error);
		return NextResponse.json({ error: "Failed to check email" }, { status: 500 });
	}
}
