import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { verificationTokens } from "@/server/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { z } from "zod";

// Only use edge runtime in production
export const runtime = 'edge';

const verifyTokenSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { token } = verifyTokenSchema.parse(body);

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
				{ message: "Invalid or expired token" },
				{ status: 400 }
			);
		}

		return NextResponse.json({ valid: true }, { status: 200 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: "Invalid input" },
				{ status: 400 }
			);
		}

		console.error("Verify reset token error:", error);
		return NextResponse.json(
			{ message: "Something went wrong" },
			{ status: 500 }
		);
	}
}