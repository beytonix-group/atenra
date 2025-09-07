import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Only use edge runtime in production
export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

const registerSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, email, password } = registerSchema.parse(body);

		// Check if email already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email.toLowerCase()))
			.get();

		if (existingUser) {
			return NextResponse.json(
				{ error: "EMAIL_EXISTS", message: "This email address is already in use" },
				{ status: 400 }
			);
		}

		// Hash password
		const saltRounds = 12;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		// Split name into first and last name
		const nameParts = name.trim().split(" ");
		const firstName = nameParts[0] || "";
		const lastName = nameParts.slice(1).join(" ") || "";

		// Create user
		const newUser = await db
			.insert(users)
			.values({
				email: email.toLowerCase(),
				passwordHash,
				firstName,
				lastName,
				displayName: name,
				emailVerified: 0, // Not verified yet
				status: "active",
			})
			.returning()
			.get();

		// Generate verification token
		const verificationToken = crypto.randomUUID();
		
		// Store verification token (you might want to create a separate table for this)
		// For now, we'll return success and implement email sending

		// TODO: Send verification email
		// await sendVerificationEmail(email, verificationToken);

		return NextResponse.json({
			success: true,
			message: "Registration successful. Please check your email to verify your account.",
			userId: newUser.id,
		});

	} catch (error) {
		console.error("Registration error:", error);
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "VALIDATION_ERROR", message: "Invalid input" },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "INTERNAL_ERROR", message: "Registration failed. Please try again." },
			{ status: 500 }
		);
	}
}