import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getStripe, getAppUrl } from "@/lib/stripe";
import { getStripeCustomerId } from "@/lib/stripe-customer";
import { getCloudflareContext } from "@opennextjs/cloudflare";


/**
 * POST /api/billing/create-portal-session
 * Create a Stripe Billing Portal Session
 */
export async function POST(_request: Request): Promise<NextResponse> {
	try {
		const stripe = getStripe();
		// Require authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user ID from database
		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		const user = await db
			.prepare(
				`
				SELECT id
				FROM users
				WHERE auth_user_id = ?
			`
			)
			.bind(session.user.id)
			.first<{ id: number }>();

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get Stripe customer ID
		const customerId = await getStripeCustomerId(user.id);

		// Create portal session
		const appUrl = getAppUrl();

		const portalSession = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: `${appUrl}/account/billing`,
		});

		return NextResponse.json({
			url: portalSession.url,
		});
	} catch (error: any) {
		console.error("Error creating portal session:", error);
		return NextResponse.json(
			{ error: error?.message ?? "Failed to create portal session" },
			{ status: 500 }
		);
	}
}
