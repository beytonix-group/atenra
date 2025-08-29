import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, verificationTokens } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { email } = forgotPasswordSchema.parse(body);

		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email.toLowerCase()))
			.get();

		if (!existingUser) {
			return NextResponse.json(
				{ message: "If an account with that email exists, we've sent you a password reset link." },
				{ status: 200 }
			);
		}

		const token = randomBytes(32).toString("hex");
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await db
			.insert(verificationTokens)
			.values({
				identifier: existingUser.email,
				token: token,
				expires: expiresAt,
			})
			.onConflictDoUpdate({
				target: [verificationTokens.identifier, verificationTokens.token],
				set: {
					expires: expiresAt,
				},
			});

		return NextResponse.json(
			{ message: "If an account with that email exists, we've sent you a password reset link." },
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: "Invalid input" },
				{ status: 400 }
			);
		}

		console.error("Forgot password error:", error);
		return NextResponse.json(
			{ message: "Something went wrong. Please try again." },
			{ status: 500 }
		);
	}
}