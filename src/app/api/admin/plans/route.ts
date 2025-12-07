import { NextResponse } from "next/server";
import { checkSuperAdmin } from "@/lib/auth-helpers";
import { getCloudflareContext } from "@opennextjs/cloudflare";


/**
 * GET /api/admin/plans
 * Fetch all subscription plans
 */
export async function GET(): Promise<NextResponse> {
	try {
		// Check super admin authorization
		const authCheck = await checkSuperAdmin();
		if (!authCheck.isAuthorized && authCheck.response) {
			return authCheck.response;
		}

		if (!authCheck.isAuthorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Access D1 database
		const env = getCloudflareContext().env;
		const d1Database = env.DATABASE as D1Database;

		if (!d1Database) {
			return NextResponse.json(
				{ error: "D1 database binding not found" },
				{ status: 500 }
			);
		}

		// Fetch all plans
		const result = await d1Database
			.prepare(`
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
					paypal_plan_id,
					trial_days,
					created_at,
					updated_at
				FROM plans
				ORDER BY price ASC;
			`)
			.all();

		return NextResponse.json({
			success: true,
			plans: result.results
		});

	} catch (err: any) {
		console.error("Error fetching plans:", err);
		return NextResponse.json(
			{ error: err?.message ?? "Unknown error" },
			{ status: 500 }
		);
	}
}
