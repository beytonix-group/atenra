import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { emailVerificationTokens } from "@/server/db/verification-tokens";
import { eq, and, gt } from "drizzle-orm";

// Only use edge runtime in production
export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");
		const email = searchParams.get("email");

		if (!token || !email) {
			return NextResponse.json(
				{ error: "Missing token or email" },
				{ status: 400 }
			);
		}

		// Check if token exists and is valid
		const verificationRecord = await db
			.select()
			.from(emailVerificationTokens)
			.where(
				and(
					eq(emailVerificationTokens.token, token),
					eq(emailVerificationTokens.email, email),
					gt(emailVerificationTokens.expires, Math.floor(Date.now() / 1000))
				)
			)
			.get();

		if (!verificationRecord) {
			return NextResponse.json(
				{ error: "Invalid or expired verification token" },
				{ status: 400 }
			);
		}

		// Update user's email verification status
		await db
			.update(users)
			.set({ emailVerified: 1 })
			.where(eq(users.email, email));

		// Delete used token
		await db
			.delete(emailVerificationTokens)
			.where(eq(emailVerificationTokens.token, token));

		// Redirect to login page with success message
		return NextResponse.redirect(
			new URL("/login?verified=true", request.url)
		);

	} catch (error) {
		console.error("Verification error:", error);
		return NextResponse.json(
			{ error: "Verification failed" },
			{ status: 500 }
		);
	}
}