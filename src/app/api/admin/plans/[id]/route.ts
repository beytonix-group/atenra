import { NextResponse } from "next/server";
import { checkSuperAdmin } from "@/lib/auth-helpers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getStripe } from "@/lib/stripe";


interface UpdatePlanBody {
	price?: number;
	name?: string;
	description?: string;
	trial_days?: number;
}

/**
 * GET /api/admin/plans/[id]
 * Get a specific plan details
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
	try {
		// Check super admin access
		const adminCheck = await checkSuperAdmin();
		if (!adminCheck.isAuthorized) {
			return adminCheck.response!;
		}

		const { id } = await params;
		const planId = parseInt(id);
		if (isNaN(planId)) {
			return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
		}

		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		const plan = await db
			.prepare(
				`
				SELECT id, name, description, price, currency, billing_period,
				       features, stripe_product_id, stripe_price_id, paypal_plan_id, trial_days,
				       is_active, created_at, updated_at
				FROM plans
				WHERE id = ?
			`
			)
			.bind(planId)
			.first();

		if (!plan) {
			return NextResponse.json({ error: "Plan not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, plan });
	} catch (error: any) {
		console.error("Error fetching plan:", error);
		return NextResponse.json({ error: error?.message ?? "Failed to fetch plan" }, { status: 500 });
	}
}

/**
 * PATCH /api/admin/plans/[id]
 * Update plan details (creates new Stripe Price if price changes)
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
	try {
		const stripe = getStripe();
		// Check super admin access
		const adminCheck = await checkSuperAdmin();
		if (!adminCheck.isAuthorized) {
			return adminCheck.response!;
		}

		const { id } = await params;
		const planId = parseInt(id);
		if (isNaN(planId)) {
			return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
		}

		const body = (await request.json()) as UpdatePlanBody;

		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		// Get current plan
		const currentPlan = await db
			.prepare(
				`
				SELECT id, name, description, price, currency, billing_period,
				       stripe_product_id, stripe_price_id, paypal_plan_id, trial_days
				FROM plans
				WHERE id = ?
			`
			)
			.bind(planId)
			.first<{
				id: number;
				name: string;
				description: string;
				price: number;
				currency: string;
				billing_period: string;
				stripe_product_id: string | null;
				stripe_price_id: string | null;
				paypal_plan_id: string | null;
				trial_days: number | null;
			}>();

		if (!currentPlan) {
			return NextResponse.json({ error: "Plan not found" }, { status: 404 });
		}

		// Prepare updates
		const updates: { [key: string]: any } = {};
		let newStripePriceId = currentPlan.stripe_price_id;

		// Handle price change
		if (body.price !== undefined && body.price !== currentPlan.price) {
			if (body.price < 0) {
				return NextResponse.json({ error: "Price must be non-negative" }, { status: 400 });
			}

			updates.price = body.price;

			// Create new Stripe Price (prices are immutable)
			if (currentPlan.stripe_product_id) {
				console.log(`Creating new Stripe Price for plan ${planId}: $${body.price}`);

				const newPrice = await stripe.prices.create({
					product: currentPlan.stripe_product_id,
					unit_amount: Math.round(body.price * 100), // Convert to cents
					currency: currentPlan.currency.toLowerCase(),
					recurring: {
						interval: currentPlan.billing_period === "monthly" ? "month" : "year",
					},
					metadata: {
						plan_id: planId.toString(),
						previous_price_id: currentPlan.stripe_price_id || "",
					},
				});

				newStripePriceId = newPrice.id;
				updates.stripe_price_id = newStripePriceId;

				// Archive old price
				if (currentPlan.stripe_price_id) {
					console.log(`Archiving old Stripe Price: ${currentPlan.stripe_price_id}`);
					await stripe.prices.update(currentPlan.stripe_price_id, {
						active: false,
					});
				}

				console.log(`✓ New Stripe Price created: ${newStripePriceId}`);
			}
		}

		// Handle name/description changes
		if (body.name !== undefined && body.name !== currentPlan.name) {
			updates.name = body.name;

			// Update Stripe Product name
			if (currentPlan.stripe_product_id) {
				await stripe.products.update(currentPlan.stripe_product_id, {
					name: body.name,
				});
			}
		}

		if (body.description !== undefined && body.description !== currentPlan.description) {
			updates.description = body.description;

			// Update Stripe Product description
			if (currentPlan.stripe_product_id) {
				await stripe.products.update(currentPlan.stripe_product_id, {
					description: body.description,
				});
			}
		}

		// Handle trial_days change
		if (body.trial_days !== undefined) {
			updates.trial_days = body.trial_days;
		}

		// If no updates, return early
		if (Object.keys(updates).length === 0) {
			return NextResponse.json({ success: true, message: "No changes to apply" });
		}

		// Build UPDATE query
		const updateFields = Object.keys(updates).map((key) => `${key} = ?`);
		const updateValues = Object.values(updates);

		await db
			.prepare(
				`
				UPDATE plans
				SET ${updateFields.join(", ")}, updated_at = unixepoch()
				WHERE id = ?
			`
			)
			.bind(...updateValues, planId)
			.run();

		// Fetch updated plan
		const updatedPlan = await db
			.prepare(
				`
				SELECT id, name, description, price, currency, billing_period,
				       features, stripe_product_id, stripe_price_id, paypal_plan_id, trial_days,
				       is_active, created_at, updated_at
				FROM plans
				WHERE id = ?
			`
			)
			.bind(planId)
			.first();

		return NextResponse.json({
			success: true,
			message: "Plan updated successfully",
			plan: updatedPlan,
			changes: updates,
		});
	} catch (error: any) {
		console.error("Error updating plan:", error);
		return NextResponse.json({ error: error?.message ?? "Failed to update plan" }, { status: 500 });
	}
}
