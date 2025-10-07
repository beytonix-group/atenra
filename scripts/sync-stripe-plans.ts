import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
	apiVersion: "2025-09-30.clover",
	typescript: true,
});

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_D1_ACCOUNT_ID || "";
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_D1_API_TOKEN || "";
const DATABASE_ID = "7ed327c0-e838-4fd5-8369-a6b5e90dd04d";

interface Plan {
	id: number;
	name: string;
	description: string;
	price: number;
	currency: string;
	billing_period: string;
	features: string;
	trial_days?: number;
	stripe_product_id?: string;
	stripe_price_id?: string;
}

async function executeD1Query(sql: string): Promise<any> {
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				sql,
			}),
		}
	);

	const result = await response.json();
	if (!result.success) {
		throw new Error(`D1 query failed: ${JSON.stringify(result.errors)}`);
	}

	return result.result[0].results;
}

async function getPlans(): Promise<Plan[]> {
	console.log("Fetching plans from database...");
	const plans = await executeD1Query(`
		SELECT id, name, description, price, currency, billing_period, features,
		       stripe_product_id, stripe_price_id, trial_days
		FROM plans
		WHERE is_active = 1
		ORDER BY price
	`);
	console.log(`Found ${plans.length} plans`);
	return plans;
}

async function updatePlan(
	planId: number,
	stripeProductId: string,
	stripePriceId: string
): Promise<void> {
	console.log(`Updating plan ${planId} with Stripe IDs...`);
	await executeD1Query(`
		UPDATE plans
		SET stripe_product_id = '${stripeProductId}',
		    stripe_price_id = '${stripePriceId}',
		    updated_at = unixepoch()
		WHERE id = ${planId}
	`);
	console.log(`✓ Plan ${planId} updated`);
}

async function syncPlans() {
	try {
		console.log("=== Starting Stripe Plan Sync ===\n");

		const plans = await getPlans();

		for (const plan of plans) {
			console.log(`\nProcessing: ${plan.name} ($${plan.price}/${plan.billing_period})`);

			let productId = plan.stripe_product_id;
			let priceId = plan.stripe_price_id;

			// Create or get Stripe Product
			if (!productId) {
				console.log("Creating Stripe Product...");
				const product = await stripe.products.create({
					name: plan.name,
					description: plan.description,
					metadata: {
						plan_id: plan.id.toString(),
					},
				});
				productId = product.id;
				console.log(`✓ Created product: ${productId}`);
			} else {
				console.log(`✓ Product already exists: ${productId}`);
			}

			// Create or get Stripe Price
			if (!priceId) {
				console.log("Creating Stripe Price...");
				const price = await stripe.prices.create({
					product: productId,
					unit_amount: Math.round(plan.price * 100), // Convert to cents
					currency: plan.currency.toLowerCase(),
					recurring: {
						interval: plan.billing_period === "monthly" ? "month" : "year",
					},
					metadata: {
						plan_id: plan.id.toString(),
					},
				});
				priceId = price.id;
				console.log(`✓ Created price: ${priceId}`);
			} else {
				console.log(`✓ Price already exists: ${priceId}`);
			}

			// Update database
			await updatePlan(plan.id, productId, priceId);
		}

		console.log("\n=== Sync Complete ===");
		console.log("\nUpdated plans:");
		const updatedPlans = await getPlans();
		updatedPlans.forEach((plan) => {
			console.log(`- ${plan.name}: ${plan.stripe_price_id}`);
		});
	} catch (error: any) {
		console.error("\n❌ Error during sync:", error.message);
		console.error(error);
		process.exit(1);
	}
}

// Run the sync
syncPlans();
