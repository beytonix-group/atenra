import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { stripe, getAppUrl } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { getRequestContext } from "@cloudflare/next-on-pages";
import type Stripe from "stripe";

export const runtime = "edge";

interface CreateCheckoutSessionBody {
	planId: number;
}

interface Plan {
	id: number;
	name: string;
	price: number;
	stripePriceId: string | null;
	trialDays: number | null;
	hasPromotion: number;
	promotionPercentOff: number | null;
	promotionMonths: number | null;
	isActive: number;
}

/**
 * POST /api/checkout/create-session
 * Create a Stripe Checkout Session for subscription with promotional pricing and trial support
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		// Require authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized. Please log in to continue." },
				{ status: 401 }
			);
		}

		// Get database access
		const env = getRequestContext().env;
		const db = env.DATABASE as D1Database;

		// Get user ID from database
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
			return NextResponse.json(
				{ error: "User account not found. Please contact support." },
				{ status: 404 }
			);
		}

		// Parse and validate request body
		const body = (await request.json()) as CreateCheckoutSessionBody;

		if (!body.planId || typeof body.planId !== 'number') {
			return NextResponse.json(
				{ error: "Invalid plan ID provided." },
				{ status: 400 }
			);
		}

		// Fetch plan from database
		const plan = await db
			.prepare(
				`
				SELECT
					id,
					name,
					price,
					stripe_price_id as stripePriceId,
					trial_days as trialDays,
					has_promotion as hasPromotion,
					promotion_percent_off as promotionPercentOff,
					promotion_months as promotionMonths,
					is_active as isActive
				FROM plans
				WHERE id = ?
			`
			)
			.bind(body.planId)
			.first<Plan>();

		// Validate plan exists
		if (!plan) {
			return NextResponse.json(
				{ error: "Plan not found. Please select a valid subscription plan." },
				{ status: 404 }
			);
		}

		// Validate plan is active
		if (plan.isActive !== 1) {
			return NextResponse.json(
				{ error: "This plan is no longer available. Please choose another plan." },
				{ status: 400 }
			);
		}

		// Validate Stripe price ID is configured
		if (!plan.stripePriceId) {
			console.error(`Plan ${plan.id} (${plan.name}) is missing Stripe price ID`);
			return NextResponse.json(
				{ error: "This plan is not properly configured. Please contact support." },
				{ status: 500 }
			);
		}

		// Get or create Stripe customer
		let customerId: string;
		try {
			customerId = await getOrCreateStripeCustomer(user.id);
		} catch (error: any) {
			console.error("Error creating Stripe customer:", error);
			return NextResponse.json(
				{ error: "Failed to set up payment account. Please try again." },
				{ status: 500 }
			);
		}

		// Build subscription data with trial period
		const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
			metadata: {
				user_id: user.id.toString(),
				plan_id: plan.id.toString(),
			},
		};

		// Add trial period if configured
		if (plan.trialDays && plan.trialDays > 0) {
			subscriptionData.trial_period_days = plan.trialDays;
		}

		// Handle promotional pricing
		let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;

		if (plan.hasPromotion === 1 && plan.promotionPercentOff && plan.promotionPercentOff > 0) {
			try {
				// Create a coupon for the promotional pricing
				const couponId = `promo_${plan.id}_${plan.promotionPercentOff}off_${plan.promotionMonths}mo`;

				// Check if coupon exists, if not create it
				let coupon: Stripe.Coupon;
				try {
					coupon = await stripe.coupons.retrieve(couponId);
				} catch (error: any) {
					// Coupon doesn't exist, create it
					if (error.code === 'resource_missing') {
						coupon = await stripe.coupons.create({
							id: couponId,
							percent_off: plan.promotionPercentOff,
							duration: plan.promotionMonths && plan.promotionMonths > 0 ? 'repeating' : 'forever',
							duration_in_months: plan.promotionMonths && plan.promotionMonths > 0 ? plan.promotionMonths : undefined,
							name: `${plan.name} - ${plan.promotionPercentOff}% off`,
						});
					} else {
						throw error;
					}
				}

				// Apply the coupon as a discount
				discounts = [{ coupon: coupon.id }];
			} catch (error: any) {
				console.error("Error creating promotional coupon:", error);
				// Continue without promotion rather than failing the entire checkout
				console.warn(`Proceeding with checkout without promotional pricing for plan ${plan.id}`);
			}
		}

		// Create Checkout Session
		const appUrl = getAppUrl();
		let checkoutSession: Stripe.Checkout.Session;

		try {
			checkoutSession = await stripe.checkout.sessions.create({
				customer: customerId,
				mode: "subscription",
				line_items: [
					{
						price: plan.stripePriceId,
						quantity: 1,
					},
				],
				success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${appUrl}/billing/cancel`,
				allow_promotion_codes: true,
				payment_method_types: ['card'],
				billing_address_collection: 'auto',
				subscription_data: subscriptionData,
				discounts: discounts,
				metadata: {
					user_id: user.id.toString(),
					plan_id: plan.id.toString(),
				},
			});
		} catch (error: any) {
			console.error("Stripe checkout session creation error:", error);

			// Handle specific Stripe errors
			if (error.type === 'StripeCardError') {
				return NextResponse.json(
					{ error: `Payment error: ${error.message}` },
					{ status: 400 }
				);
			} else if (error.type === 'StripeInvalidRequestError') {
				return NextResponse.json(
					{ error: "Invalid payment request. Please check your payment details." },
					{ status: 400 }
				);
			} else if (error.type === 'StripeAPIError') {
				return NextResponse.json(
					{ error: "Payment system temporarily unavailable. Please try again later." },
					{ status: 503 }
				);
			} else if (error.type === 'StripeConnectionError') {
				return NextResponse.json(
					{ error: "Network error. Please check your connection and try again." },
					{ status: 503 }
				);
			} else if (error.type === 'StripeAuthenticationError') {
				console.error("Stripe authentication error - check API keys");
				return NextResponse.json(
					{ error: "Payment system configuration error. Please contact support." },
					{ status: 500 }
				);
			}

			// Generic error
			return NextResponse.json(
				{ error: error?.message || "Failed to create checkout session. Please try again." },
				{ status: 500 }
			);
		}

		// Return checkout URL
		return NextResponse.json({
			url: checkoutSession.url,
		});
	} catch (error: any) {
		console.error("Unexpected error in checkout session creation:", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred. Please try again later." },
			{ status: 500 }
		);
	}
}
