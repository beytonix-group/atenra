import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

/**
 * GET /api/plans
 * Public endpoint to fetch active subscription plans
 * No authentication required - used for displaying pricing on landing page
 */
export async function GET() {
	try {
		// Access D1 database
		const env = getRequestContext().env;
		const d1Database = env.DATABASE as D1Database;

		if (!d1Database) {
			return NextResponse.json(
				{ error: "Database not available" },
				{ status: 500 }
			);
		}

		// Fetch all active plans, ordered by price
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
					trial_days
				FROM plans
				WHERE is_active = 1
				ORDER BY price ASC;
			`)
			.all();

		// Parse features JSON for each plan
		const plans = result.results.map((plan: any) => ({
			...plan,
			features: plan.features ? JSON.parse(plan.features) : []
		}));

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
