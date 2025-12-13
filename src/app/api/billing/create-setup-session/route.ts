import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getStripe, getAppUrl } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";


export async function POST(request: NextRequest) {
	try {
		const stripe = getStripe();
		const session = await auth();

		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get user ID from email
		const user = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, session.user.email))
			.limit(1)
			.then((rows) => rows[0]);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Get or create Stripe customer
		const customerId = await getOrCreateStripeCustomer(user.id);

		// Create Checkout Session for setup mode (to add payment method)
		const checkoutSession = await stripe.checkout.sessions.create({
			customer: customerId,
			mode: "setup",
			payment_method_types: ["card"],
			success_url: `${getAppUrl()}/subscription?setup=success`,
			cancel_url: `${getAppUrl()}/subscription?setup=cancelled`,
		});

		return NextResponse.json({
			sessionId: checkoutSession.id,
			url: checkoutSession.url,
		});
	} catch (error) {
		console.error("Error creating checkout session:", error);
		return NextResponse.json(
			{ error: "Failed to create checkout session" },
			{ status: 500 }
		);
	}
}
