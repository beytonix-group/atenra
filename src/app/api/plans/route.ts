import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";


/**
 * GET /api/plans
 * Public endpoint to fetch active subscription plans
 * No authentication required - used for displaying pricing on landing page
 */
export async function GET() {
	try {
		// Access D1 database
		const env = getCloudflareContext().env;
		const d1Database = env.DATABASE as D1Database;

		if (!d1Database) {
			return NextResponse.json(
				{ error: "Database not available" },
				{ status: 500 }
			);
		}

		// Fetch all active plans, ordered by plan_type and price
		const result = await d1Database
			.prepare(`
				SELECT
					id,
					name,
					plan_type,
					tagline,
					description,
					detailed_description,
					price,
					currency,
					billing_period,
					quick_view_json,
					industries_json,
					features,
					trial_days,
					is_invite_only,
					has_promotion,
					promotion_percent_off,
					promotion_months,
					has_refund_guarantee,
					stripe_product_id,
					stripe_price_id
				FROM plans
				WHERE is_active = 1
				ORDER BY
					CASE plan_type
						WHEN 'student' THEN 1
						WHEN 'regular' THEN 2
						WHEN 'business' THEN 3
					END,
					price ASC;
			`)
			.all();

		// Return plans as-is (JSON parsing handled on frontend)
		const plans = result.results;

		return NextResponse.json({
			success: true,
			plans
		});

	} catch (err: any) {
		console.error("Error fetching plans:", err);
		return NextResponse.json(
			{ error: "Failed to fetch plans" },
			{ status: 500 }
		);
	}
}
