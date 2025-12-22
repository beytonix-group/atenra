import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email-service";

const contactSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	email: z.string().email("Invalid email address"),
	message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
	try {
		const body = await request.json();

		// Validate input
		const result = contactSchema.safeParse(body);
		if (!result.success) {
			return NextResponse.json(
				{ error: "Validation failed", details: result.error.issues },
				{ status: 400 }
			);
		}

		const { name, email, message } = result.data;

		// Send email
		const emailResult = await sendContactEmail({ name, email, message });

		if (!emailResult.success) {
			console.error("Failed to send contact email:", emailResult.error);
			return NextResponse.json(
				{ error: "Failed to send message. Please try again later." },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Contact form error:", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
