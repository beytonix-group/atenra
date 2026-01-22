import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getPayPalAccessToken, verifyPayPalWebhook, mapPayPalStatus, type PayPalSubscription } from "@/lib/paypal";
import { upsertSubscription, getSubscriptionByProviderSubscriptionId } from "@/lib/subscriptions";
import { getOrderByPayPalOrderId, updateOrderStatus, clearUserCart } from "@/lib/orders";


/**
 * POST /api/paypal/webhook
 *
 * Handle PayPal webhook events with signature verification.
 *
 * Production webhook URL: https://atenra.com/api/paypal/webhook
 * Local development: Use ngrok or Cloudflare Tunnel to expose local endpoint
 *
 * Required environment variables:
 * - PAYPAL_CLIENT_ID
 * - PAYPAL_CLIENT_SECRET
 * - PAYPAL_API_BASE
 * - PAYPAL_WEBHOOK_ID
 *
 * Webhook events handled:
 * - BILLING.SUBSCRIPTION.ACTIVATED - Subscription becomes active
 * - BILLING.SUBSCRIPTION.CANCELLED - Subscription canceled by user or PayPal
 * - BILLING.SUBSCRIPTION.SUSPENDED - Subscription suspended (payment failure, etc.)
 * - BILLING.SUBSCRIPTION.UPDATED - Subscription details changed
 * - BILLING.SUBSCRIPTION.EXPIRED - Subscription expired
 * - PAYMENT.SALE.COMPLETED - Recurring payment succeeded
 * - PAYMENT.SALE.DENIED - Recurring payment failed
 *
 * Configure this webhook URL in PayPal Developer Dashboard:
 * 1. Go to https://developer.paypal.com/dashboard/applications
 * 2. Select your app
 * 3. Add webhook: https://atenra.com/api/paypal/webhook
 * 4. Subscribe to billing and payment events
 * 5. Copy the Webhook ID to PAYPAL_WEBHOOK_ID environment variable
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		// Get raw body for signature verification
		const bodyText = await request.text();
		const body = JSON.parse(bodyText);

		console.log(`[PayPal Webhook] Received event: ${body.event_type} (ID: ${body.id})`);

		// Get environment and database
		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		// Extract PayPal webhook headers (case-insensitive)
		const headers: Record<string, string | null> = {};
		request.headers.forEach((value, key) => {
			headers[key.toLowerCase()] = value;
		});

		const paypalHeaders = {
			"paypal-transmission-id": headers["paypal-transmission-id"],
			"paypal-transmission-time": headers["paypal-transmission-time"],
			"paypal-transmission-sig": headers["paypal-transmission-sig"],
			"paypal-cert-url": headers["paypal-cert-url"],
			"paypal-auth-algo": headers["paypal-auth-algo"],
		};

		// Step 1: Verify webhook signature
		console.log("[PayPal Webhook] Verifying webhook signature...");

		const accessToken = await getPayPalAccessToken(env as any);
		const isValid = await verifyPayPalWebhook(paypalHeaders, body, accessToken, env as any);

		if (!isValid) {
			console.error("[PayPal Webhook] Signature verification failed");
			return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
		}

		console.log("[PayPal Webhook] ✅ Signature verified successfully");

		// Step 2: Check for duplicate events (idempotency)
		const eventId = body.id;
		const existingEvent = await db
			.prepare(
				`
				SELECT id FROM paypal_webhook_events
				WHERE paypal_event_id = ? AND processed = 1
			`
			)
			.bind(eventId)
			.first<{ id: number }>();

		if (existingEvent) {
			console.log(`[PayPal Webhook] Event ${eventId} already processed, skipping`);
			return NextResponse.json({ received: true, note: "Already processed" });
		}

		// Step 3: Store webhook event
		const now = Math.floor(Date.now() / 1000);
		const result = await db
			.prepare(
				`
				INSERT INTO paypal_webhook_events (
					paypal_event_id,
					event_type,
					event_data,
					received_at
				) VALUES (?, ?, ?, ?)
			`
			)
			.bind(eventId, body.event_type, bodyText, now)
			.run();

		const dbEventId = result.meta.last_row_id as number;

		try {
			// Step 4: Process event based on type
			await processPayPalWebhookEvent(body, db);

			// Mark as processed
			await db
				.prepare(
					`
					UPDATE paypal_webhook_events
					SET processed = 1, processed_at = ?
					WHERE id = ?
				`
				)
				.bind(now, dbEventId)
				.run();

			console.log(`[PayPal Webhook] ✅ Successfully processed event ${eventId}`);

			return NextResponse.json({ received: true });
		} catch (processingError: any) {
			console.error("[PayPal Webhook] Processing error:", processingError);

			// Store error but don't mark as processed (PayPal will retry)
			await db
				.prepare(
					`
					UPDATE paypal_webhook_events
					SET processing_error = ?
					WHERE id = ?
				`
				)
				.bind(processingError.message || "Unknown error", dbEventId)
				.run();

			// Return 500 so PayPal retries
			return NextResponse.json(
				{
					error: "Error processing event",
					details: processingError.message,
				},
				{ status: 500 }
			);
		}
	} catch (error: any) {
		console.error("[PayPal Webhook] Fatal error:", error);
		return NextResponse.json(
			{
				error: "Webhook processing failed",
				details: error?.message || "Unknown error",
			},
			{ status: 500 }
		);
	}
}

/**
 * Process PayPal webhook events and update database
 */
async function processPayPalWebhookEvent(event: any, db: D1Database): Promise<void> {
	const eventType = event.event_type as string;
	const resource = event.resource;

	console.log(`[PayPal Webhook] Processing event type: ${eventType}`);

	switch (eventType) {
		case "BILLING.SUBSCRIPTION.ACTIVATED":
			await handleSubscriptionActivated(resource, db);
			break;

		case "BILLING.SUBSCRIPTION.CANCELLED":
			await handleSubscriptionCancelled(resource, db);
			break;

		case "BILLING.SUBSCRIPTION.SUSPENDED":
			await handleSubscriptionSuspended(resource, db);
			break;

		case "BILLING.SUBSCRIPTION.UPDATED":
			await handleSubscriptionUpdated(resource, db);
			break;

		case "BILLING.SUBSCRIPTION.EXPIRED":
			await handleSubscriptionExpired(resource, db);
			break;

		case "PAYMENT.SALE.COMPLETED":
			await handlePaymentCompleted(resource, db);
			break;

		case "PAYMENT.SALE.DENIED":
			await handlePaymentDenied(resource, db);
			break;

		// One-time payment events
		case "CHECKOUT.ORDER.APPROVED":
			await handleOrderApproved(resource, db);
			break;

		case "PAYMENT.CAPTURE.COMPLETED":
			await handleCaptureCompleted(resource, db);
			break;

		case "PAYMENT.CAPTURE.DENIED":
			await handleCaptureDenied(resource, db);
			break;

		default:
			console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
	}
}

/**
 * Handle BILLING.SUBSCRIPTION.ACTIVATED
 */
async function handleSubscriptionActivated(subscription: PayPalSubscription, _db: D1Database): Promise<void> {
	console.log(`[PayPal Webhook] Subscription activated: ${subscription.id}`);

	// Get existing subscription to find user and plan
	const existing = await getSubscriptionByProviderSubscriptionId(subscription.id);

	if (!existing) {
		console.warn(`[PayPal Webhook] Subscription ${subscription.id} not found in database, cannot activate`);
		return;
	}

	const startTime = subscription.start_time || subscription.create_time;
	const currentPeriodStart = Math.floor(new Date(startTime).getTime() / 1000);

	let currentPeriodEnd: number | undefined;
	if (subscription.billing_info?.next_billing_time) {
		currentPeriodEnd = Math.floor(new Date(subscription.billing_info.next_billing_time).getTime() / 1000);
	}

	await upsertSubscription({
		userId: existing.userId || undefined,
		planId: existing.planId,
		status: "active",
		provider: "paypal",
		externalCustomerId: subscription.subscriber.payer_id || subscription.subscriber.email_address || "",
		externalSubscriptionId: subscription.id,
		currentPeriodStart,
		currentPeriodEnd,
	});
}

/**
 * Handle BILLING.SUBSCRIPTION.CANCELLED
 */
async function handleSubscriptionCancelled(subscription: PayPalSubscription, _db: D1Database): Promise<void> {
	console.log(`[PayPal Webhook] Subscription cancelled: ${subscription.id}`);

	const existing = await getSubscriptionByProviderSubscriptionId(subscription.id);

	if (!existing) {
		console.warn(`[PayPal Webhook] Subscription ${subscription.id} not found in database`);
		return;
	}

	const now = Math.floor(Date.now() / 1000);

	await upsertSubscription({
		userId: existing.userId || undefined,
		planId: existing.planId,
		status: "canceled",
		provider: "paypal",
		externalCustomerId: existing.externalCustomerId || "",
		externalSubscriptionId: subscription.id,
		currentPeriodStart: existing.currentPeriodStart || now,
		currentPeriodEnd: existing.currentPeriodEnd || undefined,
		canceledAt: now,
	});
}

/**
 * Handle BILLING.SUBSCRIPTION.SUSPENDED
 */
async function handleSubscriptionSuspended(subscription: PayPalSubscription, _db: D1Database): Promise<void> {
	console.log(`[PayPal Webhook] Subscription suspended: ${subscription.id}`);

	const existing = await getSubscriptionByProviderSubscriptionId(subscription.id);

	if (!existing) {
		console.warn(`[PayPal Webhook] Subscription ${subscription.id} not found in database`);
		return;
	}

	await upsertSubscription({
		userId: existing.userId || undefined,
		planId: existing.planId,
		status: "suspended",
		provider: "paypal",
		externalCustomerId: existing.externalCustomerId || "",
		externalSubscriptionId: subscription.id,
		currentPeriodStart: existing.currentPeriodStart || Math.floor(Date.now() / 1000),
		currentPeriodEnd: existing.currentPeriodEnd || undefined,
	});
}

/**
 * Handle BILLING.SUBSCRIPTION.UPDATED
 */
async function handleSubscriptionUpdated(subscription: PayPalSubscription, _db: D1Database): Promise<void> {
	console.log(`[PayPal Webhook] Subscription updated: ${subscription.id}`);

	const existing = await getSubscriptionByProviderSubscriptionId(subscription.id);

	if (!existing) {
		console.warn(`[PayPal Webhook] Subscription ${subscription.id} not found in database`);
		return;
	}

	const internalStatus = mapPayPalStatus(subscription.status);

	const startTime = subscription.start_time || subscription.create_time;
	const currentPeriodStart = Math.floor(new Date(startTime).getTime() / 1000);

	let currentPeriodEnd: number | undefined;
	if (subscription.billing_info?.next_billing_time) {
		currentPeriodEnd = Math.floor(new Date(subscription.billing_info.next_billing_time).getTime() / 1000);
	}

	await upsertSubscription({
		userId: existing.userId || undefined,
		planId: existing.planId,
		status: internalStatus,
		provider: "paypal",
		externalCustomerId: subscription.subscriber.payer_id || subscription.subscriber.email_address || "",
		externalSubscriptionId: subscription.id,
		currentPeriodStart,
		currentPeriodEnd,
	});
}

/**
 * Handle BILLING.SUBSCRIPTION.EXPIRED
 */
async function handleSubscriptionExpired(subscription: PayPalSubscription, _db: D1Database): Promise<void> {
	console.log(`[PayPal Webhook] Subscription expired: ${subscription.id}`);

	const existing = await getSubscriptionByProviderSubscriptionId(subscription.id);

	if (!existing) {
		console.warn(`[PayPal Webhook] Subscription ${subscription.id} not found in database`);
		return;
	}

	const now = Math.floor(Date.now() / 1000);

	await upsertSubscription({
		userId: existing.userId || undefined,
		planId: existing.planId,
		status: "canceled",
		provider: "paypal",
		externalCustomerId: existing.externalCustomerId || "",
		externalSubscriptionId: subscription.id,
		currentPeriodStart: existing.currentPeriodStart || now,
		currentPeriodEnd: existing.currentPeriodEnd || undefined,
		canceledAt: now,
	});
}

/**
 * Handle PAYMENT.SALE.COMPLETED
 * Update next billing date when a recurring payment succeeds
 */
async function handlePaymentCompleted(payment: any, _db: D1Database): Promise<void> {
	const billingAgreementId = payment.billing_agreement_id;

	if (!billingAgreementId) {
		console.log("[PayPal Webhook] Payment has no billing agreement ID, skipping");
		return;
	}

	console.log(`[PayPal Webhook] Payment completed for subscription: ${billingAgreementId}`);

	// Note: Payment sale events don't contain full subscription info
	// We would need to fetch the subscription separately if we need to update billing dates
	// For now, just log it - the subscription.updated event will handle period updates
}

/**
 * Handle PAYMENT.SALE.DENIED
 * Mark subscription as past_due if payment fails
 */
async function handlePaymentDenied(payment: any, _db: D1Database): Promise<void> {
	const billingAgreementId = payment.billing_agreement_id;

	if (!billingAgreementId) {
		console.log("[PayPal Webhook] Payment has no billing agreement ID, skipping");
		return;
	}

	console.log(`[PayPal Webhook] Payment denied for subscription: ${billingAgreementId}`);

	const existing = await getSubscriptionByProviderSubscriptionId(billingAgreementId);

	if (!existing) {
		console.warn(`[PayPal Webhook] Subscription ${billingAgreementId} not found in database`);
		return;
	}

	// Mark as past_due
	await upsertSubscription({
		userId: existing.userId || undefined,
		planId: existing.planId,
		status: "past_due",
		provider: "paypal",
		externalCustomerId: existing.externalCustomerId || "",
		externalSubscriptionId: billingAgreementId,
		currentPeriodStart: existing.currentPeriodStart || Math.floor(Date.now() / 1000),
		currentPeriodEnd: existing.currentPeriodEnd || undefined,
	});
}

// ----------------------------------------------------------
// One-Time Payment Event Handlers
// ----------------------------------------------------------

/**
 * Handle CHECKOUT.ORDER.APPROVED
 * Order has been approved by customer but not yet captured
 */
async function handleOrderApproved(order: any, _db: D1Database): Promise<void> {
	const paypalOrderId = order.id;
	console.log(`[PayPal Webhook] Order approved: ${paypalOrderId}`);

	// Find our internal order
	const internalOrder = await getOrderByPayPalOrderId(paypalOrderId);
	if (!internalOrder) {
		console.log(`[PayPal Webhook] Order ${paypalOrderId} not found in database, may be external`);
		return;
	}

	// Update status to processing (payment approved but not captured yet)
	if (internalOrder.status === 'pending') {
		await updateOrderStatus(internalOrder.id, 'processing');
		console.log(`[PayPal Webhook] Order ${internalOrder.id} marked as processing`);
	}
}

/**
 * Handle PAYMENT.CAPTURE.COMPLETED
 * Payment has been captured successfully
 */
async function handleCaptureCompleted(capture: any, _db: D1Database): Promise<void> {
	// The capture object contains the order_id in supplementary_data
	const orderId = capture.supplementary_data?.related_ids?.order_id;
	const captureId = capture.id;

	console.log(`[PayPal Webhook] Capture completed: ${captureId} for order: ${orderId || 'unknown'}`);

	if (!orderId) {
		console.log("[PayPal Webhook] Capture has no order ID, skipping");
		return;
	}

	// Find our internal order
	const internalOrder = await getOrderByPayPalOrderId(orderId);
	if (!internalOrder) {
		console.log(`[PayPal Webhook] Order ${orderId} not found in database`);
		return;
	}

	// Check if already completed
	if (internalOrder.status === 'completed') {
		console.log(`[PayPal Webhook] Order ${internalOrder.id} already completed`);
		return;
	}

	// Update order to completed
	const now = Math.floor(Date.now() / 1000);
	await updateOrderStatus(internalOrder.id, 'completed', {
		paypalCaptureId: captureId,
		completedAt: now,
	});

	// Clear user's cart
	await clearUserCart(internalOrder.userId);

	console.log(`[PayPal Webhook] Order ${internalOrder.id} completed, cart cleared for user ${internalOrder.userId}`);
}

/**
 * Handle PAYMENT.CAPTURE.DENIED
 * Payment capture failed
 */
async function handleCaptureDenied(capture: any, _db: D1Database): Promise<void> {
	const orderId = capture.supplementary_data?.related_ids?.order_id;
	const captureId = capture.id;

	console.log(`[PayPal Webhook] Capture denied: ${captureId} for order: ${orderId || 'unknown'}`);

	if (!orderId) {
		console.log("[PayPal Webhook] Capture has no order ID, skipping");
		return;
	}

	// Find our internal order
	const internalOrder = await getOrderByPayPalOrderId(orderId);
	if (!internalOrder) {
		console.log(`[PayPal Webhook] Order ${orderId} not found in database`);
		return;
	}

	// Update order to failed
	await updateOrderStatus(internalOrder.id, 'failed');

	console.log(`[PayPal Webhook] Order ${internalOrder.id} marked as failed`);
}
