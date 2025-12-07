import { getCloudflareContext } from "@opennextjs/cloudflare";
import { type PlanSlug } from "./plans";

export interface Subscription {
	id: number;
	userId: number | null;
	companyId: number | null;
	planId: number;
	status: string;
	provider: string | null;
	externalCustomerId: string | null;
	externalSubscriptionId: string | null;
	currentPeriodStart: number | null;
	currentPeriodEnd: number | null;
	trialEnd: number | null;
	cancelAtPeriodEnd: number;
	canceledAt: number | null;
	canceledReason: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Get user's active subscription
 */
export async function getUserActiveSubscription(userId: number): Promise<Subscription | null> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const subscription = await db
		.prepare(
			`
			SELECT
				id,
				user_id as userId,
				company_id as companyId,
				plan_id as planId,
				status,
				provider,
				external_customer_id as externalCustomerId,
				external_subscription_id as externalSubscriptionId,
				current_period_start as currentPeriodStart,
				current_period_end as currentPeriodEnd,
				trial_end as trialEnd,
				cancel_at_period_end as cancelAtPeriodEnd,
				canceled_at as canceledAt,
				canceled_reason as canceledReason,
				created_at as createdAt,
				updated_at as updatedAt
			FROM subscriptions
			WHERE user_id = ? AND status IN ('active', 'trialing')
			ORDER BY created_at DESC
			LIMIT 1
		`
		)
		.bind(userId)
		.first<Subscription>();

	return subscription;
}

/**
 * Get user's subscription by provider subscription ID
 */
export async function getSubscriptionByProviderSubscriptionId(
	providerSubscriptionId: string
): Promise<Subscription | null> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const subscription = await db
		.prepare(
			`
			SELECT
				id,
				user_id as userId,
				company_id as companyId,
				plan_id as planId,
				status,
				provider,
				external_customer_id as externalCustomerId,
				external_subscription_id as externalSubscriptionId,
				current_period_start as currentPeriodStart,
				current_period_end as currentPeriodEnd,
				trial_end as trialEnd,
				cancel_at_period_end as cancelAtPeriodEnd,
				canceled_at as canceledAt,
				canceled_reason as canceledReason,
				created_at as createdAt,
				updated_at as updatedAt
			FROM subscriptions
			WHERE external_subscription_id = ?
		`
		)
		.bind(providerSubscriptionId)
		.first<Subscription>();

	return subscription;
}

/**
 * Get effective plan for a user (returns plan slug or 'guest' if no active subscription)
 * Works with both Stripe and PayPal subscriptions
 */
export async function getEffectivePlan(userId: number): Promise<{
	slug: PlanSlug | "guest";
	status: string;
	subscription: Subscription | null;
}> {
	const subscription = await getUserActiveSubscription(userId);

	if (!subscription) {
		return {
			slug: "guest",
			status: "inactive",
			subscription: null,
		};
	}

	// Get plan name from database
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const plan = await db
		.prepare(
			`
			SELECT name
			FROM plans
			WHERE id = ?
		`
		)
		.bind(subscription.planId)
		.first<{ name: string }>();

	if (!plan) {
		return {
			slug: "guest",
			status: "inactive",
			subscription: null,
		};
	}

	// Convert plan name to slug
	const slug = plan.name.toLowerCase() as PlanSlug;

	return {
		slug,
		status: subscription.status,
		subscription,
	};
}

/**
 * Check if user has an active subscription (regardless of provider)
 * Returns true for both Stripe and PayPal active subscriptions
 */
export async function hasActiveSubscription(userId: number): Promise<boolean> {
	const subscription = await getUserActiveSubscription(userId);
	return subscription !== null && (subscription.status === "active" || subscription.status === "trialing");
}

/**
 * Get subscription provider for a user
 * Returns 'stripe', 'paypal', 'braintree', or null if no active subscription
 */
export async function getSubscriptionProvider(userId: number): Promise<string | null> {
	const subscription = await getUserActiveSubscription(userId);
	return subscription?.provider || null;
}

/**
 * Upsert subscription from Stripe data
 */
export async function upsertSubscription(data: {
	userId?: number;
	companyId?: number;
	planId: number;
	status: string;
	provider: string;
	externalCustomerId: string;
	externalSubscriptionId: string;
	currentPeriodStart: number;
	currentPeriodEnd?: number;
	trialEnd?: number;
	cancelAtPeriodEnd?: boolean;
	canceledAt?: number;
	stripeCheckoutSessionId?: string;
}): Promise<void> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const now = Math.floor(Date.now() / 1000);

	// Check if subscription already exists
	const existing = await getSubscriptionByProviderSubscriptionId(data.externalSubscriptionId);

	if (existing) {
		// Update existing subscription
		await db
			.prepare(
				`
				UPDATE subscriptions
				SET
					plan_id = ?,
					status = ?,
					current_period_start = ?,
					current_period_end = ?,
					trial_end = ?,
					cancel_at_period_end = ?,
					canceled_at = ?,
					${data.stripeCheckoutSessionId ? "stripe_checkout_session_id = ?," : ""}
					updated_at = ?
				WHERE external_subscription_id = ?
			`
			)
			.bind(
				data.planId,
				data.status,
				data.currentPeriodStart,
				data.currentPeriodEnd || null,
				data.trialEnd || null,
				data.cancelAtPeriodEnd ? 1 : 0,
				data.canceledAt || null,
				...(data.stripeCheckoutSessionId ? [data.stripeCheckoutSessionId] : []),
				now,
				data.externalSubscriptionId
			)
			.run();
	} else {
		// Insert new subscription
		await db
			.prepare(
				`
				INSERT INTO subscriptions (
					user_id,
					company_id,
					plan_id,
					status,
					provider,
					external_customer_id,
					external_subscription_id,
					current_period_start,
					current_period_end,
					trial_end,
					cancel_at_period_end,
					canceled_at,
					${data.stripeCheckoutSessionId ? "stripe_checkout_session_id," : ""}
					created_at,
					updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${data.stripeCheckoutSessionId ? "?," : ""} ?, ?)
			`
			)
			.bind(
				data.userId || null,
				data.companyId || null,
				data.planId,
				data.status,
				data.provider,
				data.externalCustomerId,
				data.externalSubscriptionId,
				data.currentPeriodStart,
				data.currentPeriodEnd || null,
				data.trialEnd || null,
				data.cancelAtPeriodEnd ? 1 : 0,
				data.canceledAt || null,
				...(data.stripeCheckoutSessionId ? [data.stripeCheckoutSessionId] : []),
				now,
				now
			)
			.run();
	}
}
