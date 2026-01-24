import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, verificationTokens } from "@/server/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hashPasswordEdge } from "@/lib/password-utils";
import { z } from "zod";


const resetPasswordSchema = z.object({
	token: z.string().min(1, "Token is required"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { token, password } = resetPasswordSchema.parse(body);

		const existingToken = await db
			.select()
			.from(verificationTokens)
			.where(and(
				eq(verificationTokens.token, token),
				gt(verificationTokens.expires, new Date())
			))
			.get();

		if (!existingToken) {
			return NextResponse.json(
				{ message: "Invalid or expired reset link" },
				{ status: 400 }
			);
		}

		const hashedPassword = await hashPasswordEdge(password);

		await db
			.update(users)
			.set({ 
				passwordHash: hashedPassword,
				emailVerified: 1,
			})
			.where(eq(users.email, existingToken.identifier));

		await db
			.delete(verificationTokens)
			.where(eq(verificationTokens.token, token));

		return NextResponse.json(
			{ message: "Password reset successful" },
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: "Invalid input" },
				{ status: 400 }
			);
		}

		console.error("Reset password error:", error);
		return NextResponse.json(
			{ message: "Something went wrong. Please try again." },
			{ status: 500 }
		);
	}
}