import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getStripe } from "./stripe";

export interface User {
	id: number;
	email: string;
	firstName: string | null;
	lastName: string | null;
	displayName: string | null;
	stripeCustomerId: string | null;
}

/**
 * Get or create a Stripe customer for a user
 * If user doesn't have a stripe_customer_id, creates one and saves it
 * @param userId The user's database ID
 * @returns Stripe customer ID
 */
export async function getOrCreateStripeCustomer(userId: number): Promise<string> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	// Get user from database
	const user = await db
		.prepare(
			`
			SELECT
				id,
				email,
				first_name as firstName,
				last_name as lastName,
				display_name as displayName,
				stripe_customer_id as stripeCustomerId
			FROM users
			WHERE id = ?
		`
		)
		.bind(userId)
		.first<User>();

	if (!user) {
		throw new Error(`User ${userId} not found`);
	}

	// Return existing customer ID if available
	if (user.stripeCustomerId) {
		return user.stripeCustomerId;
	}

	// Create new Stripe customer
	const stripe = getStripe();
	const customer = await stripe.customers.create({
		email: user.email,
		name: user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
		metadata: {
			userId: userId.toString(),
		},
	});

	// Save customer ID to database
	await db
		.prepare(
			`
			UPDATE users
			SET stripe_customer_id = ?, updated_at = unixepoch()
			WHERE id = ?
		`
		)
		.bind(customer.id, userId)
		.run();

	return customer.id;
}

/**
 * Get Stripe customer ID for a user (throws if not found)
 */
export async function getStripeCustomerId(userId: number): Promise<string> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const user = await db
		.prepare(
			`
			SELECT stripe_customer_id as stripeCustomerId
			FROM users
			WHERE id = ?
		`
		)
		.bind(userId)
		.first<{ stripeCustomerId: string | null }>();

	if (!user || !user.stripeCustomerId) {
		throw new Error(`User ${userId} does not have a Stripe customer ID`);
	}

	return user.stripeCustomerId;
}
