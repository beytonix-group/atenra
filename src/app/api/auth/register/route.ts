import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { emailVerificationTokens } from "@/server/db/verification-tokens";
import { eq } from "drizzle-orm";
import { hashPasswordEdge } from "@/lib/password-utils";
import { sendEmailVerificationEmail } from "@/lib/email-service";
import { z } from "zod";
import { trackActivity } from "@/lib/server-activity-tracker";


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

		// Hash password using PBKDF2 (edge-compatible)
		const passwordHash = await hashPasswordEdge(password);

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
		const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours

		// Store verification token
		await db.insert(emailVerificationTokens).values({
			email: email.toLowerCase(),
			token: verificationToken,
			expires: expiresAt,
		});

		// Send verification email
		const emailResult = await sendEmailVerificationEmail({
			email: email.toLowerCase(),
			verificationToken,
			userName: name,
			expiresInHours: 24,
		});

		if (!emailResult.success) {
			console.error("Failed to send verification email:", emailResult.error);
			// Clean up the orphaned token since email failed
			await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, verificationToken));
		}

		// Track user registration
		if (newUser) {
			await trackActivity({
				userId: newUser.id,
				action: "user_register",
				info: {
					email: newUser.email,
					registrationMethod: "email",
					verificationEmailSent: emailResult.success,
				},
				request,
			});
		}

		return NextResponse.json({
			success: true,
			message: emailResult.success
				? "Registration successful. Please check your email to verify your account."
				: "Account created. We had trouble sending a verification email - please use the resend option if you don't receive it.",
			userId: newUser.id,
			emailSent: emailResult.success,
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