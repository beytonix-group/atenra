import { getRequestContext } from "@cloudflare/next-on-pages";
import { type PlanSlug } from "./plans";

export interface Subscription {
	id: number;
	userId: number | null;
	companyId: number | null;
	planId: number;
	status: string;
	provider: string | null;
	providerCustomerId: string | null;
	providerSubscriptionId: string | null;
	startDate: number;
	endDate: number | null;
	trialStartDate: number | null;
	trialEndDate: number | null;
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
	const env = getRequestContext().env;
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
				provider_customer_id as providerCustomerId,
				provider_subscription_id as providerSubscriptionId,
				start_date as startDate,
				end_date as endDate,
				trial_start_date as trialStartDate,
				trial_end_date as trialEndDate,
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
	const env = getRequestContext().env;
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
				provider_customer_id as providerCustomerId,
				provider_subscription_id as providerSubscriptionId,
				start_date as startDate,
				end_date as endDate,
				trial_start_date as trialStartDate,
				trial_end_date as trialEndDate,
				cancel_at_period_end as cancelAtPeriodEnd,
				canceled_at as canceledAt,
				canceled_reason as canceledReason,
				created_at as createdAt,
				updated_at as updatedAt
			FROM subscriptions
			WHERE provider_subscription_id = ?
		`
		)
		.bind(providerSubscriptionId)
		.first<Subscription>();

	return subscription;
}

/**
 * Get effective plan for a user (returns plan slug or 'guest' if no active subscription)
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
	const env = getRequestContext().env;
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
 * Upsert subscription from Stripe data
 */
export async function upsertSubscription(data: {
	userId?: number;
	companyId?: number;
	planId: number;
	status: string;
	provider: string;
	providerCustomerId: string;
	providerSubscriptionId: string;
	startDate: number;
	endDate?: number;
	trialStartDate?: number;
	trialEndDate?: number;
	cancelAtPeriodEnd?: boolean;
	canceledAt?: number;
	stripeCheckoutSessionId?: string;
}): Promise<void> {
	const env = getRequestContext().env;
	const db = env.DATABASE as D1Database;

	const now = Math.floor(Date.now() / 1000);

	// Check if subscription already exists
	const existing = await getSubscriptionByProviderSubscriptionId(data.providerSubscriptionId);

	if (existing) {
		// Update existing subscription
		await db
			.prepare(
				`
				UPDATE subscriptions
				SET
					plan_id = ?,
					status = ?,
					start_date = ?,
					end_date = ?,
					trial_start_date = ?,
					trial_end_date = ?,
					cancel_at_period_end = ?,
					canceled_at = ?,
					${data.stripeCheckoutSessionId ? "stripe_checkout_session_id = ?," : ""}
					updated_at = ?
				WHERE provider_subscription_id = ?
			`
			)
			.bind(
				data.planId,
				data.status,
				data.startDate,
				data.endDate || null,
				data.trialStartDate || null,
				data.trialEndDate || null,
				data.cancelAtPeriodEnd ? 1 : 0,
				data.canceledAt || null,
				...(data.stripeCheckoutSessionId ? [data.stripeCheckoutSessionId] : []),
				now,
				data.providerSubscriptionId
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
					provider_customer_id,
					provider_subscription_id,
					start_date,
					end_date,
					trial_start_date,
					trial_end_date,
					cancel_at_period_end,
					canceled_at,
					${data.stripeCheckoutSessionId ? "stripe_checkout_session_id," : ""}
					created_at,
					updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${data.stripeCheckoutSessionId ? "?," : ""} ?, ?)
			`
			)
			.bind(
				data.userId || null,
				data.companyId || null,
				data.planId,
				data.status,
				data.provider,
				data.providerCustomerId,
				data.providerSubscriptionId,
				data.startDate,
				data.endDate || null,
				data.trialStartDate || null,
				data.trialEndDate || null,
				data.cancelAtPeriodEnd ? 1 : 0,
				data.canceledAt || null,
				...(data.stripeCheckoutSessionId ? [data.stripeCheckoutSessionId] : []),
				now,
				now
			)
			.run();
	}
}
