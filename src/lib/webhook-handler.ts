import type Stripe from "stripe";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { upsertSubscription, getSubscriptionByProviderSubscriptionId } from "./subscriptions";

/**
 * Check if webhook event has already been processed (idempotency)
 */
async function isEventProcessed(stripeEventId: string): Promise<boolean> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const event = await db
		.prepare(
			`
			SELECT id
			FROM stripe_webhook_events
			WHERE stripe_event_id = ? AND processed = 1
		`
		)
		.bind(stripeEventId)
		.first();

	return !!event;
}

/**
 * Store webhook event in database (uses INSERT OR IGNORE to handle duplicates)
 */
async function storeWebhookEvent(stripeEventId: string, eventType: string, eventData: string): Promise<number | null> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	// Use INSERT OR IGNORE to handle race conditions with duplicate events
	await db
		.prepare(
			`
			INSERT OR IGNORE INTO stripe_webhook_events (stripe_event_id, event_type, event_data, received_at)
			VALUES (?, ?, ?, unixepoch())
		`
		)
		.bind(stripeEventId, eventType, eventData)
		.run();

	// Get the event ID (whether just inserted or already existed)
	const event = await db
		.prepare(`SELECT id FROM stripe_webhook_events WHERE stripe_event_id = ?`)
		.bind(stripeEventId)
		.first<{ id: number }>();

	return event?.id || null;
}

/**
 * Mark webhook event as processed
 */
async function markEventProcessed(eventId: number): Promise<void> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	await db
		.prepare(
			`
			UPDATE stripe_webhook_events
			SET processed = 1, processed_at = unixepoch()
			WHERE id = ?
		`
		)
		.bind(eventId)
		.run();
}

/**
 * Mark webhook event as failed
 */
async function markEventFailed(eventId: number, error: string): Promise<void> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	await db
		.prepare(
			`
			UPDATE stripe_webhook_events
			SET processing_error = ?
			WHERE id = ?
		`
		)
		.bind(error, eventId)
		.run();
}

/**
 * Get user ID from Stripe customer ID
 */
async function getUserIdFromCustomer(stripeCustomerId: string): Promise<number | null> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const user = await db
		.prepare(
			`
			SELECT id
			FROM users
			WHERE stripe_customer_id = ?
		`
		)
		.bind(stripeCustomerId)
		.first<{ id: number }>();

	return user?.id || null;
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
	if (session.mode !== "subscription" || !session.subscription) {
		return;
	}

	const subscriptionId =
		typeof session.subscription === "string" ? session.subscription : session.subscription.id;

	const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null;
	const planId = session.metadata?.plan_id ? parseInt(session.metadata.plan_id) : null;

	if (!userId || !planId) {
		throw new Error("Missing user_id or plan_id in session metadata");
	}

	// Get subscription details (we might not have all details in the session object)
	// For now, upsert with basic info - the subscription.created event will have full details
	await upsertSubscription({
		userId,
		planId,
		status: "active",
		provider: "stripe",
		externalCustomerId: session.customer as string,
		externalSubscriptionId: subscriptionId,
		currentPeriodStart: Math.floor(Date.now() / 1000),
		stripeCheckoutSessionId: session.id,
	});
}

/**
 * Handle customer.subscription.created/updated/deleted events
 */
async function handleSubscriptionEvent(subscription: Stripe.Subscription): Promise<void> {
	const userId = await getUserIdFromCustomer(subscription.customer as string);
	const planId = subscription.metadata?.plan_id ? parseInt(subscription.metadata.plan_id) : null;

	if (!userId) {
		throw new Error(`User not found for Stripe customer ${subscription.customer}`);
	}

	if (!planId) {
		// Try to get plan ID from existing subscription
		const existing = await getSubscriptionByProviderSubscriptionId(subscription.id);
		if (!existing) {
			throw new Error(`Plan ID not found in subscription metadata for ${subscription.id}`);
		}
	}

	const finalPlanId = planId || (await getSubscriptionByProviderSubscriptionId(subscription.id))?.planId;

	if (!finalPlanId) {
		throw new Error(`Could not determine plan ID for subscription ${subscription.id}`);
	}

	await upsertSubscription({
		userId,
		planId: finalPlanId,
		status: subscription.status,
		provider: "stripe",
		externalCustomerId: subscription.customer as string,
		externalSubscriptionId: subscription.id,
		currentPeriodStart: (subscription as any).current_period_start,
		currentPeriodEnd: (subscription as any).current_period_end,
		trialEnd: (subscription as any).trial_end || null,
		cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
		canceledAt: (subscription as any).canceled_at || null,
	});
}

/**
 * Handle invoice events
 */
async function handleInvoiceEvent(invoice: Stripe.Invoice): Promise<void> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const userId = await getUserIdFromCustomer(invoice.customer as string);

	if (!userId) {
		throw new Error(`User not found for Stripe customer ${invoice.customer}`);
	}

	// Get subscription ID from database
	let subscriptionId: number | null = null;
	if ((invoice as any).subscription) {
		const sub = await getSubscriptionByProviderSubscriptionId((invoice as any).subscription as string);
		subscriptionId = sub?.id || null;
	}

	// Upsert invoice
	const now = Math.floor(Date.now() / 1000);

	const existing = await db
		.prepare(
			`
			SELECT id
			FROM invoices
			WHERE stripe_invoice_id = ?
		`
		)
		.bind(invoice.id)
		.first<{ id: number }>();

	if (existing) {
		// Update
		await db
			.prepare(
				`
				UPDATE invoices
				SET
					subscription_id = ?,
					amount_due = ?,
					amount_paid = ?,
					status = ?,
					hosted_invoice_url = ?,
					invoice_pdf = ?,
					due_date = ?,
					paid_at = ?,
					updated_at = ?
				WHERE stripe_invoice_id = ?
			`
			)
			.bind(
				subscriptionId,
				(invoice as any).amount_due,
				(invoice as any).amount_paid,
				invoice.status,
				(invoice as any).hosted_invoice_url,
				(invoice as any).invoice_pdf,
				(invoice as any).due_date,
				invoice.status === "paid" ? now : null,
				now,
				invoice.id
			)
			.run();
	} else {
		// Insert
		await db
			.prepare(
				`
				INSERT INTO invoices (
					user_id,
					subscription_id,
					stripe_invoice_id,
					stripe_customer_id,
					amount_due,
					amount_paid,
					status,
					hosted_invoice_url,
					invoice_pdf,
					due_date,
					paid_at,
					created_at,
					updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`
			)
			.bind(
				userId,
				subscriptionId,
				invoice.id,
				invoice.customer,
				(invoice as any).amount_due,
				(invoice as any).amount_paid,
				invoice.status,
				(invoice as any).hosted_invoice_url,
				(invoice as any).invoice_pdf,
				(invoice as any).due_date,
				invoice.status === "paid" ? now : null,
				now,
				now
			)
			.run();
	}
}

/**
 * Handle payment_intent events
 */
async function handlePaymentIntentEvent(paymentIntent: Stripe.PaymentIntent): Promise<void> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const userId = await getUserIdFromCustomer(paymentIntent.customer as string);

	if (!userId) {
		throw new Error(`User not found for Stripe customer ${paymentIntent.customer}`);
	}

	const now = Math.floor(Date.now() / 1000);

	// Upsert payment transaction
	const existing = await db
		.prepare(
			`
			SELECT id
			FROM payment_transactions
			WHERE stripe_payment_intent_id = ?
		`
		)
		.bind(paymentIntent.id)
		.first<{ id: number }>();

	const status = paymentIntent.status === "succeeded" ? "succeeded" : "failed";

	if (existing) {
		// Update
		await db
			.prepare(
				`
				UPDATE payment_transactions
				SET
					amount_cents = ?,
					currency = ?,
					status = ?,
					failure_code = ?,
					failure_message = ?,
					updated_at = ?
				WHERE stripe_payment_intent_id = ?
			`
			)
			.bind(
				paymentIntent.amount,
				paymentIntent.currency,
				status,
				paymentIntent.last_payment_error?.code || null,
				paymentIntent.last_payment_error?.message || null,
				now,
				paymentIntent.id
			)
			.run();
	} else {
		// Insert
		await db
			.prepare(
				`
				INSERT INTO payment_transactions (
					user_id,
					stripe_payment_intent_id,
					amount_cents,
					currency,
					status,
					txn_type,
					failure_code,
					failure_message,
					created_at,
					updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`
			)
			.bind(
				userId,
				paymentIntent.id,
				paymentIntent.amount,
				paymentIntent.currency,
				status,
				"payment",
				paymentIntent.last_payment_error?.code || null,
				paymentIntent.last_payment_error?.message || null,
				now,
				now
			)
			.run();
	}
}

/**
 * Main webhook handler
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
	// Check idempotency
	if (await isEventProcessed(event.id)) {
		console.log(`Event ${event.id} already processed, skipping`);
		return;
	}

	// Store event (handles duplicates gracefully)
	const eventId = await storeWebhookEvent(event.id, event.type, JSON.stringify(event.data.object));

	// If we couldn't get an event ID, it means something went wrong
	if (!eventId) {
		console.log(`Event ${event.id} could not be stored, may already exist`);
		return;
	}

	try {
		// Handle different event types
		switch (event.type) {
			case "checkout.session.completed":
				await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
				break;

			case "customer.subscription.created":
			case "customer.subscription.updated":
			case "customer.subscription.deleted":
				await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
				break;

			case "invoice.created":
			case "invoice.finalized":
			case "invoice.paid":
			case "invoice.payment_failed":
				await handleInvoiceEvent(event.data.object as Stripe.Invoice);
				break;

			case "payment_intent.succeeded":
			case "payment_intent.payment_failed":
				await handlePaymentIntentEvent(event.data.object as Stripe.PaymentIntent);
				break;

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		// Mark as processed
		await markEventProcessed(eventId);
	} catch (error: any) {
		console.error(`Error processing event ${event.id}:`, error);
		await markEventFailed(eventId, error.message);
		throw error;
	}
}
