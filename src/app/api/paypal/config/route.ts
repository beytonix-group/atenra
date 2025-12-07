import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";


/**
 * GET /api/paypal/config
 *
 * Returns PayPal configuration for client-side use.
 * Only exposes non-sensitive configuration like plan IDs.
 *
 * This endpoint is public and doesn't require authentication.
 */
export async function GET(): Promise<NextResponse> {
	try {
		const env = getCloudflareContext().env;

		const planId = env.PAYPAL_SUBSCRIPTION_PLAN_ID || process.env.PAYPAL_SUBSCRIPTION_PLAN_ID;

		console.log("[PayPal Config] Fetching plan ID:", {
			fromCloudflare: !!env.PAYPAL_SUBSCRIPTION_PLAN_ID,
			fromProcess: !!process.env.PAYPAL_SUBSCRIPTION_PLAN_ID,
			planId: planId?.substring(0, 5) + "..." || "NOT SET",
		});

		if (!planId) {
			console.error("[PayPal Config] ERROR: PAYPAL_SUBSCRIPTION_PLAN_ID not configured");
			return NextResponse.json(
				{
					error: "PayPal plan not configured",
					details: "PAYPAL_SUBSCRIPTION_PLAN_ID environment variable is missing",
				},
				{ status: 500 }
			);
		}

		if (planId === "P-REPLACE_WITH_YOUR_PLAN_ID") {
			console.warn("[PayPal Config] WARNING: Using placeholder plan ID. Create a real plan in PayPal Dashboard.");
			return NextResponse.json(
				{
					error: "PayPal plan not properly configured",
					details: "Please replace P-REPLACE_WITH_YOUR_PLAN_ID with an actual PayPal subscription plan ID",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({
			planId,
		});
	} catch (error: any) {
		console.error("[PayPal Config] Error:", error);
		return NextResponse.json({ error: "Failed to load PayPal configuration" }, { status: 500 });
	}
}
