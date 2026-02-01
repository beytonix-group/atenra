import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/server/auth";


/**
 * GET /api/paypal/plan-id?planId=123
 *
 * Returns the PayPal plan ID for a specific plan from the database.
 * This is used by PayPalSubscriptionButton to get the correct PayPal plan ID
 * for the selected Atenra plan.
 *
 * Query Parameters:
 * - planId: The internal Atenra plan ID
 *
 * Response:
 * - 200: { paypalPlanId: "P-XXXXXXXXX" }
 * - 400: { error: "Missing planId parameter" }
 * - 404: { error: "Plan not found or no PayPal plan ID" }
 * - 500: { error: "Internal server error" }
 */
export async function GET(request: Request): Promise<NextResponse> {
	try {
		// Require authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const planId = searchParams.get("planId");

		if (!planId) {
			return NextResponse.json({ error: "Missing planId parameter" }, { status: 400 });
		}

		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		// Fetch the plan's PayPal plan ID from database
		const plan = await db
			.prepare(
				`
				SELECT paypal_plan_id
				FROM plans
				WHERE id = ? AND is_active = 1
			`
			)
			.bind(parseInt(planId, 10))
			.first<{ paypal_plan_id: string | null }>();

		if (!plan || !plan.paypal_plan_id) {
			console.error(`[PayPal Plan ID] No PayPal plan ID found for plan ${planId}`);
			return NextResponse.json(
				{
					error: "Plan not found or not synced with PayPal",
					details: "Please run the PayPal plan sync to create PayPal billing plans",
				},
				{ status: 404 }
			);
		}

		console.log(`[PayPal Plan ID] Returning PayPal plan ID for plan ${planId}:`, plan.paypal_plan_id);

		return NextResponse.json({
			paypalPlanId: plan.paypal_plan_id,
		});
	} catch (error: any) {
		console.error("[PayPal Plan ID] Error:", error);
		return NextResponse.json({ error: "Failed to load PayPal plan ID" }, { status: 500 });
	}
}
