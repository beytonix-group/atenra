/**
 * PayPal Plans Sync Library
 *
 * Mirrors the Stripe plans sync functionality for PayPal billing plans.
 * Handles creation, updates, and synchronization of plans between Atenra database and PayPal.
 *
 * Key differences from Stripe:
 * - PayPal uses a single "Plan" concept (not separate Product + Price)
 * - PayPal plan prices CAN be updated, but this affects ALL existing subscribers
 * - When price changes, we create a NEW plan to avoid affecting existing subscribers (same pattern as Stripe)
 *
 * IMPORTANT: This sync should only be triggered by super admin users.
 */

import { getRequestContext } from "@cloudflare/next-on-pages";
import {
	createPayPalPlan,
	getPayPalPlan,
	updatePayPalPlanPricing,
	deactivatePayPalPlan,
	getPayPalAccessToken,
} from "./paypal";

/**
 * Result of syncing a single plan with PayPal
 */
export interface PayPalPlanSyncResult {
	planId: number;
	planName: string;
	success: boolean;
	paypalPlanId: string | null;
	error?: string;
}

/**
 * Plan data structure for syncing
 */
export interface PlanToSyncWithPayPal {
	id: number;
	name: string;
	description: string | null;
	price: number; // Price in dollars (e.g., 29.00)
	currency: string;
	billing_period: string; // "monthly" or "yearly"
	paypalPlanId: string | null;
}

/**
 * Sync a single plan with PayPal
 *
 * This function:
 * 1. Creates a new PayPal plan if one doesn't exist
 * 2. If the plan exists but price/interval changed, creates a NEW plan (to avoid affecting existing subscribers)
 * 3. Updates the database with the PayPal plan ID
 *
 * NOTE: Unlike Stripe which has immutable prices, PayPal allows price updates.
 * However, updating a PayPal plan's price affects ALL existing subscribers.
 * To match Stripe behavior and protect existing subscribers, we create a new plan when price changes.
 *
 * @param plan - Plan data from database
 * @param env - Cloudflare environment (for database and PayPal credentials)
 * @returns Result of the sync operation
 */
export async function syncPlanWithPayPal(
	plan: PlanToSyncWithPayPal,
	env: {
		DATABASE: D1Database;
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
		PAYPAL_PRODUCT_ID?: string;
	}
): Promise<PayPalPlanSyncResult> {
	try {
		let paypalPlanId = plan.paypalPlanId;
		const db = env.DATABASE;

		// If no PayPal plan exists, create a new one
		if (!paypalPlanId) {
			console.log(`[PayPal Sync] Creating new PayPal plan for "${plan.name}"`);

			// Convert billing_period to interval format
			const interval = plan.billing_period.toLowerCase().includes("year") ? "year" : "month";
			// Convert price to cents
			const priceCents = Math.round(plan.price * 100);

			const paypalPlan = await createPayPalPlan(env, {
				name: plan.name,
				description: plan.description || undefined,
				priceCents: priceCents,
				currency: plan.currency,
				interval: interval,
			});

			paypalPlanId = paypalPlan.id;

			console.log(`[PayPal Sync] Created PayPal plan ${paypalPlanId} for "${plan.name}"`);
		} else {
			// PayPal plan exists - verify it's still valid and check for price changes
			try {
				const accessToken = await getPayPalAccessToken(env);
				const existingPlan = await getPayPalPlan(paypalPlanId, accessToken, env);

				// Convert our plan data to comparable format
				const interval = plan.billing_period.toLowerCase().includes("year") ? "year" : "month";
				const priceCents = Math.round(plan.price * 100);

				// Check if price or interval changed
				const currentPriceCents = Math.round(
					parseFloat(existingPlan.billing_cycles[0].pricing_scheme.fixed_price.value) * 100
				);
				const currentInterval = existingPlan.billing_cycles[0].frequency.interval_unit.toLowerCase();
				const expectedInterval = interval === "month" ? "month" : "year";

				const priceChanged = currentPriceCents !== priceCents;
				const intervalChanged = currentInterval !== expectedInterval;

				if (priceChanged || intervalChanged) {
					console.log(
						`[PayPal Sync] Plan "${plan.name}" has changed (price: ${priceChanged}, interval: ${intervalChanged}). Creating new PayPal plan.`
					);

					// Deactivate old plan (prevents new subscriptions, existing ones continue)
					await deactivatePayPalPlan(env, paypalPlanId);

					// Create new plan with updated details
					const newPayPalPlan = await createPayPalPlan(env, {
						name: plan.name,
						description: plan.description || undefined,
						priceCents: priceCents,
						currency: plan.currency,
						interval: interval,
					});

					paypalPlanId = newPayPalPlan.id;

					console.log(
						`[PayPal Sync] Created new PayPal plan ${paypalPlanId} for "${plan.name}" (old plan deactivated)`
					);
				} else {
					console.log(`[PayPal Sync] Plan "${plan.name}" is up to date with PayPal plan ${paypalPlanId}`);
				}
			} catch (error: any) {
				// If plan was deleted or not found, create a new one
				if (error.message.includes("404") || error.message.includes("not found")) {
					console.log(`[PayPal Sync] Existing PayPal plan ${paypalPlanId} not found. Creating new one.`);

					const paypalPlan = await createPayPalPlan(env, {
						name: plan.name,
						description: plan.description || undefined,
						priceCents: priceCents,
						currency: plan.currency,
						interval: interval,
					});

					paypalPlanId = paypalPlan.id;

					console.log(`[PayPal Sync] Created replacement PayPal plan ${paypalPlanId}`);
				} else {
					throw error;
				}
			}
		}

		// Update database with PayPal plan ID
		await db
			.prepare(
				`
				UPDATE plans
				SET paypal_plan_id = ?, updated_at = unixepoch()
				WHERE id = ?
			`
			)
			.bind(paypalPlanId, plan.id)
			.run();

		return {
			planId: plan.id,
			planName: plan.name,
			success: true,
			paypalPlanId: paypalPlanId,
		};
	} catch (error: any) {
		console.error(`[PayPal Sync] Error syncing plan ${plan.id} (${plan.name}) with PayPal:`, error);
		return {
			planId: plan.id,
			planName: plan.name,
			success: false,
			paypalPlanId: null,
			error: error?.message || "Unknown error",
		};
	}
}

/**
 * Sync all active plans with PayPal
 *
 * Fetches all active plans from the database and syncs each one with PayPal.
 * Processes plans sequentially with delays to avoid rate limits.
 *
 * @param env - Cloudflare environment (for database and PayPal credentials)
 * @returns Array of sync results for each plan
 */
export async function syncAllPlansWithPayPal(env: {
	DATABASE: D1Database;
	PAYPAL_CLIENT_ID?: string;
	PAYPAL_CLIENT_SECRET?: string;
	PAYPAL_API_BASE?: string;
	PAYPAL_PRODUCT_ID?: string;
}): Promise<PayPalPlanSyncResult[]> {
	const db = env.DATABASE;

	// Fetch all active plans
	const result = await db
		.prepare(
			`
			SELECT
				id,
				name,
				description,
				price,
				currency,
				billing_period,
				paypal_plan_id as paypalPlanId
			FROM plans
			WHERE is_active = 1
			ORDER BY id ASC
		`
		)
		.all();

	const plans = result.results as unknown as PlanToSyncWithPayPal[];

	if (!plans || plans.length === 0) {
		console.log("[PayPal Sync] No active plans found to sync");
		return [];
	}

	console.log(`[PayPal Sync] Syncing ${plans.length} active plan(s) with PayPal`);

	// Sync each plan sequentially to avoid rate limits
	const results: PayPalPlanSyncResult[] = [];
	for (const plan of plans) {
		const syncResult = await syncPlanWithPayPal(plan, env);
		results.push(syncResult);

		// Small delay to avoid PayPal rate limits
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	const successCount = results.filter((r) => r.success).length;
	console.log(`[PayPal Sync] Completed: ${successCount}/${results.length} plans synced successfully`);

	return results;
}

/**
 * Deactivate a plan's PayPal billing plan
 *
 * Deactivates the PayPal plan (prevents new subscriptions) and clears the PayPal plan ID from database.
 * Existing subscriptions on the plan continue unchanged.
 *
 * @param planId - Database plan ID
 * @param env - Cloudflare environment
 */
export async function archivePayPalPlanResources(
	planId: number,
	env: {
		DATABASE: D1Database;
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
		PAYPAL_PRODUCT_ID?: string;
	}
): Promise<void> {
	const db = env.DATABASE;

	// Get plan's PayPal ID
	const plan = await db
		.prepare(
			`
			SELECT paypal_plan_id
			FROM plans
			WHERE id = ?
		`
		)
		.bind(planId)
		.first<{ paypal_plan_id: string | null }>();

	if (!plan) {
		throw new Error(`Plan ${planId} not found`);
	}

	// Deactivate PayPal plan (if exists)
	if (plan.paypal_plan_id) {
		try {
			await deactivatePayPalPlan(env, plan.paypal_plan_id);
			console.log(`[PayPal Archive] Deactivated PayPal plan ${plan.paypal_plan_id}`);
		} catch (error: any) {
			console.warn(`[PayPal Archive] Could not deactivate plan ${plan.paypal_plan_id}:`, error.message);
		}
	}

	// Clear PayPal plan ID from database
	await db
		.prepare(
			`
			UPDATE plans
			SET paypal_plan_id = NULL, updated_at = unixepoch()
			WHERE id = ?
		`
		)
		.bind(planId)
		.run();

	console.log(`[PayPal Archive] Cleared PayPal plan ID for plan ${planId}`);
}

/**
 * Ensure a PayPal plan exists for a given plan
 *
 * This is a convenience wrapper around syncPlanWithPayPal that can be called
 * when a plan is created or updated.
 *
 * @param planId - Database plan ID
 * @returns PayPal plan ID
 */
export async function ensurePayPalPlanForPlan(planId: number): Promise<string> {
	const env = getRequestContext().env as {
		DATABASE: D1Database;
		PAYPAL_CLIENT_ID?: string;
		PAYPAL_CLIENT_SECRET?: string;
		PAYPAL_API_BASE?: string;
		PAYPAL_PRODUCT_ID?: string;
	};

	const db = env.DATABASE;

	// Fetch plan details
	const plan = await db
		.prepare(
			`
			SELECT
				id,
				name,
				description,
				price,
				currency,
				billing_period,
				paypal_plan_id as paypalPlanId
			FROM plans
			WHERE id = ?
		`
		)
		.bind(planId)
		.first<PlanToSyncWithPayPal>();

	if (!plan) {
		throw new Error(`Plan ${planId} not found`);
	}

	const result = await syncPlanWithPayPal(plan, env);

	if (!result.success || !result.paypalPlanId) {
		throw new Error(result.error || "Failed to sync plan with PayPal");
	}

	return result.paypalPlanId;
}
