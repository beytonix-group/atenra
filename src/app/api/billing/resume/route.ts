import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getStripe } from "@/lib/stripe";
import { getUserActiveSubscription } from "@/lib/subscriptions";
import { getCloudflareContext } from "@opennextjs/cloudflare";


/**
 * POST /api/billing/resume
 * Resume (un-cancel) user's subscription
 */
export async function POST(request: Request): Promise<NextResponse> {
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

		// Get active subscription
		const subscription = await getUserActiveSubscription(user.id);

		if (!subscription) {
			return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
		}

		if (!subscription.externalSubscriptionId) {
			return NextResponse.json(
				{ error: "Subscription does not have a provider subscription ID" },
				{ status: 400 }
			);
		}

		if (!subscription.cancelAtPeriodEnd) {
			return NextResponse.json(
				{ error: "Subscription is not scheduled for cancellation" },
				{ status: 400 }
			);
		}

		// Resume subscription in Stripe
		const updatedSubscription = await stripe.subscriptions.update(subscription.externalSubscriptionId, {
			cancel_at_period_end: false,
		});

		// Update database
		const now = Math.floor(Date.now() / 1000);
		await db
			.prepare(
				`
				UPDATE subscriptions
				SET
					cancel_at_period_end = 0,
					canceled_at = NULL,
					updated_at = ?
				WHERE id = ?
			`
			)
			.bind(now, subscription.id)
			.run();

		return NextResponse.json({
			success: true,
			cancel_at_period_end: updatedSubscription.cancel_at_period_end,
		});
	} catch (error: any) {
		console.error("Error resuming subscription:", error);
		return NextResponse.json(
			{ error: error?.message ?? "Failed to resume subscription" },
			{ status: 500 }
		);
	}
}
