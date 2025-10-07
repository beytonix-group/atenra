import { getRequestContext } from "@cloudflare/next-on-pages";

export type PlanSlug = "essentials" | "premium" | "executive";

export interface Plan {
	id: number;
	name: string;
	description: string | null;
	price: number;
	currency: string;
	billing_period: string;
	features: string | null;
	is_active: number;
	stripe_product_id: string | null;
	stripe_price_id: string | null;
	trial_days: number | null;
	created_at: number;
	updated_at: number;
}

/**
 * Get plan by slug (essentials, premium, executive)
 * @param slug Plan slug
 * @returns Plan or null
 */
export async function getPlanBySlug(slug: PlanSlug): Promise<Plan | null> {
	const env = getRequestContext().env;
	const db = env.DATABASE as D1Database;

	// Map slug to plan name (capitalize first letter)
	const planName = slug.charAt(0).toUpperCase() + slug.slice(1);

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
				features,
				is_active,
				stripe_product_id,
				stripe_price_id,
				trial_days,
				created_at,
				updated_at
			FROM plans
			WHERE name = ? AND is_active = 1
		`
		)
		.bind(planName)
		.first<Plan>();

	return plan;
}

/**
 * Get all active plans
 */
export async function getActivePlans(): Promise<Plan[]> {
	const env = getRequestContext().env;
	const db = env.DATABASE as D1Database;

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
				features,
				is_active,
				stripe_product_id,
				stripe_price_id,
				trial_days,
				created_at,
				updated_at
			FROM plans
			WHERE is_active = 1
			ORDER BY price ASC
		`
		)
		.all<Plan>();

	return result.results;
}

/**
 * Get plan by ID
 */
export async function getPlanById(planId: number): Promise<Plan | null> {
	const env = getRequestContext().env;
	const db = env.DATABASE as D1Database;

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
				features,
				is_active,
				stripe_product_id,
				stripe_price_id,
				trial_days,
				created_at,
				updated_at
			FROM plans
			WHERE id = ?
		`
		)
		.bind(planId)
		.first<Plan>();

	return plan;
}
