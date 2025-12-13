import { getStripe } from "./stripe";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface PlanSyncResult {
	planId: number;
	planName: string;
	success: boolean;
	stripeProductId: string | null;
	stripePriceId: string | null;
	error?: string;
}

export interface PlanToSync {
	id: number;
	name: string;
	description: string | null;
	price: number;
	currency: string;
	billingPeriod: string;
	stripeProductId: string | null;
	stripePriceId: string | null;
}

/**
 * Sync a single plan with Stripe by creating/updating product and price
 * @param plan Plan data from database
 * @returns Result of the sync operation
 */
export async function syncPlanWithStripe(plan: PlanToSync): Promise<PlanSyncResult> {
	try {
		const stripe = getStripe();
		let productId = plan.stripeProductId;
		let priceId = plan.stripePriceId;

		// Create or update Stripe Product
		if (!productId) {
			// Create new product
			const product = await stripe.products.create({
				name: plan.name,
				description: plan.description || undefined,
				metadata: {
					plan_id: plan.id.toString(),
				},
			});
			productId = product.id;
		} else {
			// Update existing product
			try {
				await stripe.products.update(productId, {
					name: plan.name,
					description: plan.description || undefined,
					metadata: {
						plan_id: plan.id.toString(),
					},
				});
			} catch (error: any) {
				if (error.code === 'resource_missing') {
					// Product was deleted, create new one
					const product = await stripe.products.create({
						name: plan.name,
						description: plan.description || undefined,
						metadata: {
							plan_id: plan.id.toString(),
						},
					});
					productId = product.id;
					priceId = null; // Reset price since product was recreated
				} else {
					throw error;
				}
			}
		}

		// Determine billing interval
		const interval = plan.billingPeriod.toLowerCase().includes('year')
			? 'year'
			: 'month';

		// Create new price (Stripe prices are immutable, so we always create new ones if price changed)
		if (!priceId) {
			const price = await stripe.prices.create({
				product: productId,
				unit_amount: Math.round(plan.price * 100), // Convert to cents
				currency: plan.currency.toLowerCase(),
				recurring: {
					interval: interval,
				},
				metadata: {
					plan_id: plan.id.toString(),
				},
			});
			priceId = price.id;
		} else {
			// Verify existing price is still valid
			try {
				const existingPrice = await stripe.prices.retrieve(priceId);

				// Check if price details match
				const priceChanged =
					existingPrice.unit_amount !== Math.round(plan.price * 100) ||
					existingPrice.currency !== plan.currency.toLowerCase() ||
					existingPrice.recurring?.interval !== interval;

				if (priceChanged) {
					// Archive old price and create new one
					await stripe.prices.update(priceId, { active: false });

					const newPrice = await stripe.prices.create({
						product: productId,
						unit_amount: Math.round(plan.price * 100),
						currency: plan.currency.toLowerCase(),
						recurring: {
							interval: interval,
						},
						metadata: {
							plan_id: plan.id.toString(),
						},
					});
					priceId = newPrice.id;
				}
			} catch (error: any) {
				if (error.code === 'resource_missing') {
					// Price was deleted, create new one
					const price = await stripe.prices.create({
						product: productId,
						unit_amount: Math.round(plan.price * 100),
						currency: plan.currency.toLowerCase(),
						recurring: {
							interval: interval,
						},
						metadata: {
							plan_id: plan.id.toString(),
						},
					});
					priceId = price.id;
				} else {
					throw error;
				}
			}
		}

		// Update database with Stripe IDs
		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		await db
			.prepare(
				`
				UPDATE plans
				SET stripe_product_id = ?, stripe_price_id = ?, updated_at = unixepoch()
				WHERE id = ?
			`
			)
			.bind(productId, priceId, plan.id)
			.run();

		return {
			planId: plan.id,
			planName: plan.name,
			success: true,
			stripeProductId: productId,
			stripePriceId: priceId,
		};
	} catch (error: any) {
		console.error(`Error syncing plan ${plan.id} (${plan.name}) with Stripe:`, error);
		return {
			planId: plan.id,
			planName: plan.name,
			success: false,
			stripeProductId: null,
			stripePriceId: null,
			error: error?.message || 'Unknown error',
		};
	}
}

/**
 * Sync all active plans with Stripe
 * @returns Array of sync results for each plan
 */
export async function syncAllPlansWithStripe(): Promise<PlanSyncResult[]> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

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
				billing_period as billingPeriod,
				stripe_product_id as stripeProductId,
				stripe_price_id as stripePriceId
			FROM plans
			WHERE is_active = 1
			ORDER BY id ASC
		`
		)
		.all();

	const plans = result.results as unknown as PlanToSync[];

	if (!plans || plans.length === 0) {
		return [];
	}

	// Sync each plan sequentially to avoid rate limits
	const results: PlanSyncResult[] = [];
	for (const plan of plans) {
		const syncResult = await syncPlanWithStripe(plan);
		results.push(syncResult);

		// Small delay to avoid Stripe rate limits
		await new Promise(resolve => setTimeout(resolve, 100));
	}

	return results;
}

/**
 * Delete a plan's Stripe product and price (archives them, doesn't actually delete)
 * @param planId Database plan ID
 */
export async function archiveStripePlanResources(planId: number): Promise<void> {
	const stripe = getStripe();
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	// Get plan's Stripe IDs
	const plan = await db
		.prepare(
			`
			SELECT stripe_product_id, stripe_price_id
			FROM plans
			WHERE id = ?
		`
		)
		.bind(planId)
		.first<{ stripe_product_id: string | null; stripe_price_id: string | null }>();

	if (!plan) {
		throw new Error(`Plan ${planId} not found`);
	}

	// Archive price first (if exists)
	if (plan.stripe_price_id) {
		try {
			await stripe.prices.update(plan.stripe_price_id, { active: false });
		} catch (error: any) {
			console.warn(`Could not archive price ${plan.stripe_price_id}:`, error.message);
		}
	}

	// Archive product (if exists)
	if (plan.stripe_product_id) {
		try {
			await stripe.products.update(plan.stripe_product_id, { active: false });
		} catch (error: any) {
			console.warn(`Could not archive product ${plan.stripe_product_id}:`, error.message);
		}
	}

	// Clear Stripe IDs from database
	await db
		.prepare(
			`
			UPDATE plans
			SET stripe_product_id = NULL, stripe_price_id = NULL, updated_at = unixepoch()
			WHERE id = ?
		`
		)
		.bind(planId)
		.run();
}
