import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { stripe, getAppUrl } from "@/lib/stripe";
import { getPlanBySlug, type PlanSlug } from "@/lib/plans";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface CreateCheckoutSessionBody {
	planSlug: PlanSlug;
}

/**
 * POST /api/billing/create-checkout-session
 * Create a Stripe Checkout Session for subscription
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		// Require authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user ID from database
		const env = getRequestContext().env;
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

		// Parse request body
		const body = (await request.json()) as CreateCheckoutSessionBody;

		console.log("Creating checkout session for plan slug:", body.planSlug);

		if (!body.planSlug) {
			return NextResponse.json({ error: "planSlug is required" }, { status: 400 });
		}

		// Validate plan slug
		if (!["essentials", "premium", "executive"].includes(body.planSlug)) {
			console.error("Invalid plan slug:", body.planSlug);
			return NextResponse.json({ error: `Invalid plan slug: ${body.planSlug}` }, { status: 400 });
		}

		// Get plan from database
		const plan = await getPlanBySlug(body.planSlug);

		if (!plan) {
			console.error("Plan not found in database for slug:", body.planSlug);
			return NextResponse.json({ error: `Plan not found: ${body.planSlug}` }, { status: 404 });
		}

		console.log("Found plan:", plan.name, "Price ID:", plan.stripe_price_id);

		if (!plan.stripe_price_id) {
			console.error("Plan missing Stripe price ID:", plan.name);
			return NextResponse.json(
				{ error: "Plan does not have a Stripe price ID configured" },
				{ status: 400 }
			);
		}

		// Get or create Stripe customer
		const customerId = await getOrCreateStripeCustomer(user.id);

		// Create Checkout Session
		const appUrl = getAppUrl();

		const checkoutSession = await stripe.checkout.sessions.create({
			customer: customerId,
			mode: "subscription",
			line_items: [
				{
					price: plan.stripe_price_id,
					quantity: 1,
				},
			],
			success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${appUrl}/billing/cancel`,
			allow_promotion_codes: true,
			subscription_data: {
				trial_period_days: plan.trial_days && plan.trial_days > 0 ? plan.trial_days : undefined,
				metadata: {
					user_id: user.id.toString(),
					plan_id: plan.id.toString(),
				},
			},
			metadata: {
				user_id: user.id.toString(),
				plan_id: plan.id.toString(),
			},
		});

		return NextResponse.json({
			url: checkoutSession.url,
		});
	} catch (error: any) {
		console.error("Error creating checkout session:", error);
		return NextResponse.json(
			{ error: error?.message ?? "Failed to create checkout session" },
			{ status: 500 }
		);
	}
}
