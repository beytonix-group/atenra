import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { stripe } from "@/lib/stripe";
import { getUserActiveSubscription } from "@/lib/subscriptions";
import { getCloudflareContext } from "@opennextjs/cloudflare";


/**
 * POST /api/billing/cancel
 * Cancel user's subscription at period end
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
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

		// Cancel subscription at period end in Stripe
		const updatedSubscription = await stripe.subscriptions.update(subscription.externalSubscriptionId, {
			cancel_at_period_end: true,
		});

		// Update database
		const now = Math.floor(Date.now() / 1000);
		await db
			.prepare(
				`
				UPDATE subscriptions
				SET
					cancel_at_period_end = 1,
					canceled_at = ?,
					updated_at = ?
				WHERE id = ?
			`
			)
			.bind(now, now, subscription.id)
			.run();

		// Log the cancellation activity for audit trail
		try {
			await db
				.prepare(
					`
					INSERT INTO user_activities (
						user_id,
						activity_type,
						description,
						metadata,
						created_at
					) VALUES (?, ?, ?, ?, ?)
				`
				)
				.bind(
					user.id,
					'subscription_cancelled',
					`Subscription cancelled for plan ID ${subscription.planId}`,
					JSON.stringify({
						subscription_id: subscription.id,
						plan_id: subscription.planId,
						stripe_subscription_id: subscription.externalSubscriptionId,
						cancel_at_period_end: true,
						period_end: subscription.currentPeriodEnd,
					}),
					now
				)
				.run();
		} catch (activityError) {
			console.error("Error logging cancellation activity:", activityError);
			// Don't fail the request if activity logging fails
		}

		console.log(`✅ Subscription ${subscription.externalSubscriptionId} cancelled successfully for user ${user.id}`);
		console.log(`   - Cancels at period end: ${new Date(subscription.currentPeriodEnd! * 1000).toISOString()}`);
		console.log(`   - Stripe subscription ID: ${subscription.externalSubscriptionId}`);

		return NextResponse.json({
			success: true,
			cancel_at_period_end: updatedSubscription.cancel_at_period_end,
			message: 'Subscription cancelled successfully. Access will continue until the end of your billing period.',
		});
	} catch (error: any) {
		console.error("Error canceling subscription:", error);
		return NextResponse.json(
			{ error: error?.message ?? "Failed to cancel subscription" },
			{ status: 500 }
		);
	}
}
