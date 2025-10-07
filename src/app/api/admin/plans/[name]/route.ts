import { NextResponse } from "next/server";
import { checkSuperAdmin } from "@/lib/auth-helpers";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface UpdatePlanBody {
	price?: number;
	description?: string;
	features?: string[];
	stripeProductId?: string;
	stripePriceId?: string;
	trialDays?: number;
}

/**
 * PATCH /api/admin/plans/[name]
 * Update plan details including price, description, features, and Stripe integration
 */
export async function PATCH(
	request: Request,
	{ params }: { params: { name: string } }
): Promise<NextResponse> {
	try {
		// Check super admin authorization
		const authCheck = await checkSuperAdmin();
		if (!authCheck.isAuthorized && authCheck.response) {
			return authCheck.response;
		}

		if (!authCheck.isAuthorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const planName = decodeURIComponent(params.name);

		// Validate plan name
		const validPlanNames = ["Essentials", "Premium", "Executive"];
		if (!validPlanNames.includes(planName)) {
			return NextResponse.json(
				{ error: `Invalid plan name. Must be one of: ${validPlanNames.join(", ")}` },
				{ status: 400 }
			);
		}

		// Parse request body
		const body = (await request.json()) as UpdatePlanBody;

		// Validate at least one field is provided
		if (!body || Object.keys(body).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 }
			);
		}

		// Access D1 database
		const env = getRequestContext().env;
		const d1Database = env.DATABASE as D1Database;

		if (!d1Database) {
			return NextResponse.json(
				{ error: "D1 database binding not found" },
				{ status: 500 }
			);
		}

		// Build update query
		const updates: string[] = [];
		const queryParams: (string | number | null)[] = [];

		if (body.price !== undefined) {
			if (body.price <= 0) {
				return NextResponse.json(
					{ error: "Price must be greater than 0" },
					{ status: 400 }
				);
			}
			updates.push("price = ?");
			queryParams.push(body.price);
		}

		if (body.description !== undefined) {
			updates.push("description = ?");
			queryParams.push(body.description);
		}

		if (body.features !== undefined) {
			updates.push("features = ?");
			queryParams.push(JSON.stringify(body.features));
		}

		if (body.stripeProductId !== undefined) {
			updates.push("stripe_product_id = ?");
			queryParams.push(body.stripeProductId || null);
		}

		if (body.stripePriceId !== undefined) {
			updates.push("stripe_price_id = ?");
			queryParams.push(body.stripePriceId || null);
		}

		if (body.trialDays !== undefined) {
			updates.push("trial_days = ?");
			queryParams.push(body.trialDays);
		}

		// Always update timestamp
		updates.push("updated_at = unixepoch()");

		// Add plan name for WHERE clause
		queryParams.push(planName);

		// Execute update
		const stmt = `
			UPDATE plans
			SET ${updates.join(", ")}
			WHERE name = ?;
		`;

		const updateResult = await d1Database.prepare(stmt).bind(...queryParams).run();

		if (updateResult.meta.changes === 0) {
			return NextResponse.json(
				{ error: `Plan '${planName}' not found` },
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
					features,
					stripe_product_id,
					stripe_price_id,
					trial_days,
					is_active,
					created_at,
					updated_at
				FROM plans
				WHERE name = ?;
			`)
			.bind(planName)
			.first();

		return NextResponse.json({
			success: true,
			plan: planResult
		});

	} catch (err: any) {
		console.error("Error updating plan:", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}
