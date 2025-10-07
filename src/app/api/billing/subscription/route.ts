import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getEffectivePlan, getUserActiveSubscription } from "@/lib/subscriptions";

export const runtime = "edge";

/**
 * GET /api/billing/subscription
 * Get current user's subscription details
 */
export async function GET(): Promise<NextResponse> {
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

		// Get effective plan
		const planInfo = await getEffectivePlan(user.id);

		if (planInfo.slug === "guest") {
			return NextResponse.json({
				status: "inactive",
				planSlug: "guest",
			});
		}

		// Get subscription details
		const subscription = await getUserActiveSubscription(user.id);

		if (!subscription) {
			return NextResponse.json({
				status: "inactive",
				planSlug: "guest",
			});
		}

		// Get plan details from database
		const plan = await db
			.prepare(
				`
				SELECT name, description, price, currency, billing_period, features
				FROM plans
				WHERE id = ?
			`
			)
			.bind(subscription.planId)
			.first<{
				name: string;
				description: string;
				price: number;
				currency: string;
				billing_period: string;
				features: string;
			}>();

		return NextResponse.json({
			status: subscription.status,
			planSlug: planInfo.slug,
			plan: plan
				? {
						name: plan.name,
						price: plan.price,
						currency: plan.currency,
						billing_period: plan.billing_period,
				  }
				: undefined,
			currentPeriodEnd: subscription.currentPeriodEnd,
			cancelAtPeriodEnd: subscription.cancelAtPeriodEnd === 1,
		});
	} catch (error: unknown) {
		console.error("Error fetching subscription:", error);
		return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
	}
}
