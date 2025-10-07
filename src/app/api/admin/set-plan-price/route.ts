import { NextResponse } from "next/server";
import { checkSuperAdmin } from "@/lib/auth-helpers";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface SetPlanPriceBody {
	name: "Essentials" | "Premium" | "Executive";
	stripeProductId?: string;
	stripePriceId: string;
	trialDays?: number;
}

/**
 * Protected admin route to update Stripe IDs for subscription plans
 *
 * Usage:
 * POST /api/admin/set-plan-price
 * Body: {
 *   name: "Essentials",
 *   stripeProductId: "prod_xxx",
 *   stripePriceId: "price_xxx",
 *   trialDays: 0
 * }
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		// Check super admin authorization
		const authCheck = await checkSuperAdmin();
		if (!authCheck.isAuthorized && authCheck.response) {
			return authCheck.response;
		}

		if (!authCheck.isAuthorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Parse and validate request body
		const body = (await request.json()) as SetPlanPriceBody;

		if (!body?.name) {
			return NextResponse.json(
				{ error: "name is required" },
				{ status: 400 }
			);
		}

		// Validate plan name
		const validPlanNames = ["Essentials", "Premium", "Executive"];
		if (!validPlanNames.includes(body.name)) {
			return NextResponse.json(
				{ error: `Invalid plan name. Must be one of: ${validPlanNames.join(", ")}` },
				{ status: 400 }
			);
		}

		// Access D1 database directly for raw SQL execution
		const env = getRequestContext().env;
		const d1Database = env.DATABASE as D1Database;

		if (!d1Database) {
			return NextResponse.json(
				{ error: "D1 database binding not found" },
				{ status: 500 }
			);
		}

		// Build update query with optional fields
		const updates: string[] = [];
		const params: (string | number | null)[] = [];

		// Only update Stripe Product ID if provided
		if (body.stripeProductId !== undefined && body.stripeProductId !== null) {
			updates.push("stripe_product_id = ?");
			params.push(body.stripeProductId);
		}

		// Only update Stripe Price ID if provided
		if (body.stripePriceId) {
			updates.push("stripe_price_id = ?");
			params.push(body.stripePriceId);
		}

		// Only update trial days if provided
		if (body.trialDays !== undefined && Number.isInteger(body.trialDays)) {
			updates.push("trial_days = ?");
			params.push(body.trialDays);
		}

		// Always update the updated_at timestamp
		updates.push("updated_at = unixepoch()");

		// If no updates were specified, return error
		if (updates.length === 1) { // Only updated_at
			return NextResponse.json(
				{ error: "No fields to update. Provide at least one of: stripeProductId, stripePriceId, or trialDays" },
				{ status: 400 }
			);
		}

		// Build the query
		const stmt = `
			UPDATE plans
			SET ${updates.join(", ")}
			WHERE name = ?;
		`;

		// Add the plan name as the final parameter
		params.push(body.name);

		// Execute update
		const updateResult = await d1Database.prepare(stmt).bind(...params).run();

		if (updateResult.meta.changes === 0) {
			return NextResponse.json(
				{ error: `Plan '${body.name}' not found` },
				{ status: 404 }
			);
		}

		// Fetch updated plan
		const planResult = await d1Database
			.prepare(`
				SELECT
					id,
					name,
					description,
					price,
					currency,
					billing_period,
					stripe_product_id,
					stripe_price_id,
					trial_days,
					is_active
				FROM plans
				WHERE name = ?;
			`)
			.bind(body.name)
			.first();

		return NextResponse.json({
			success: true,
			plan: planResult
		});

	} catch (err: any) {
		console.error("Error updating plan Stripe IDs:", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}
