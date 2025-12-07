import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getPayPalAccessToken, getPayPalSubscription, getPayPalPlanId, mapPayPalStatus } from "@/lib/paypal";
import { upsertSubscription } from "@/lib/subscriptions";


/**
 * POST /api/paypal/subscription/attach
 *
 * Attach and verify a PayPal subscription for the authenticated user.
 *
 * This endpoint is called from the frontend after the user completes the PayPal
 * subscription flow. It verifies the subscription with PayPal's API and stores
 * it in the database using the same subscription model as Stripe.
 *
 * Required environment variables (server-side):
 * - PAYPAL_CLIENT_ID
 * - PAYPAL_CLIENT_SECRET
 * - PAYPAL_API_BASE
 * - PAYPAL_SUBSCRIPTION_PLAN_ID
 *
 * Request body:
 * {
 *   "subscriptionId": "I-XXXXXXXXX",  // PayPal subscription ID
 *   "planId": 123                      // Internal plan ID from database
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "subscription": {
 *     "id": "I-XXXXXXXXX",
 *     "status": "active",
 *     "planId": 123,
 *     "provider": "paypal",
 *     "currentPeriodEnd": 1234567890
 *   }
 * }
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		// Require authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body
		const body = (await request.json()) as {
			subscriptionId: string;
			planId: number;
		};

		const { subscriptionId, planId } = body;

		if (!subscriptionId || !planId) {
			return NextResponse.json({ error: "Missing subscriptionId or planId" }, { status: 400 });
		}

		// Get database connection
		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		// Get internal user ID from auth user ID
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

		// Verify plan exists
		const plan = await db
			.prepare(
				`
				SELECT id, name
				FROM plans
				WHERE id = ?
			`
			)
			.bind(planId)
			.first<{ id: number; name: string }>();

		if (!plan) {
			return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
		}

		console.log(`[PayPal] Attaching subscription ${subscriptionId} for user ${user.id} to plan ${plan.name}`);

		// Step 1: Get PayPal OAuth token
		const accessToken = await getPayPalAccessToken(env as any);

		// Step 2: Fetch subscription details from PayPal
		const paypalSubscription = await getPayPalSubscription(subscriptionId, accessToken, env as any);

		console.log(`[PayPal] Fetched subscription details:`, {
			id: paypalSubscription.id,
			status: paypalSubscription.status,
			plan_id: paypalSubscription.plan_id,
		});

		// Step 3: Validate subscription
		const expectedPlanId = getPayPalPlanId(env as any);
		if (paypalSubscription.plan_id !== expectedPlanId) {
			return NextResponse.json(
				{
					error: "Invalid subscription plan",
					details: `Expected plan ${expectedPlanId}, got ${paypalSubscription.plan_id}`,
				},
				{ status: 400 }
			);
		}

		// Validate status - should be ACTIVE, APPROVED, or APPROVAL_PENDING
		const validStatuses = ["ACTIVE", "APPROVED", "APPROVAL_PENDING"];
		if (!validStatuses.includes(paypalSubscription.status)) {
			return NextResponse.json(
				{
					error: "Invalid subscription status",
					details: `Subscription status is ${paypalSubscription.status}. Expected one of: ${validStatuses.join(", ")}`,
				},
				{ status: 400 }
			);
		}

		// Step 4: Map PayPal subscription to our internal format and save to database
		const internalStatus = mapPayPalStatus(paypalSubscription.status);

		// Calculate period timestamps
		const startTime = paypalSubscription.start_time || paypalSubscription.create_time;
		const currentPeriodStart = Math.floor(new Date(startTime).getTime() / 1000);

		// Get next billing time from billing_info if available
		let currentPeriodEnd: number | undefined;
		if (paypalSubscription.billing_info?.next_billing_time) {
			currentPeriodEnd = Math.floor(new Date(paypalSubscription.billing_info.next_billing_time).getTime() / 1000);
		}

		// Extract PayPal payer ID as external customer ID
		const externalCustomerId = paypalSubscription.subscriber.payer_id || paypalSubscription.subscriber.email_address || "";

		await upsertSubscription({
			userId: user.id,
			planId: plan.id,
			status: internalStatus,
			provider: "paypal",
			externalCustomerId,
			externalSubscriptionId: subscriptionId,
			currentPeriodStart,
			currentPeriodEnd,
		});

		console.log(`[PayPal] Successfully attached subscription for user ${user.id}`);

		// Return success response
		return NextResponse.json({
			success: true,
			subscription: {
				id: subscriptionId,
				status: internalStatus,
				planId: plan.id,
				planName: plan.name,
				provider: "paypal",
				currentPeriodStart,
				currentPeriodEnd,
				paypalSubscriber: {
					email: paypalSubscription.subscriber.email_address,
					payerId: paypalSubscription.subscriber.payer_id,
				},
			},
		});
	} catch (error: any) {
		console.error("[PayPal] Error attaching subscription:", error);

		return NextResponse.json(
			{
				error: "Failed to attach PayPal subscription",
				details: error?.message || "Unknown error",
			},
			{ status: 500 }
		);
	}
}
