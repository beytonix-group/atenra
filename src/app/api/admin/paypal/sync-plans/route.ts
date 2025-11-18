/**
 * POST /api/admin/paypal/sync-plans
 *
 * Protected admin endpoint for syncing plans with PayPal.
 * Mirrors the Stripe sync endpoint functionality.
 *
 * AUTHORIZATION: Requires super admin role
 * - Returns 401 if not authenticated
 * - Returns 403 if not super admin
 *
 * REQUEST BODY (optional):
 * {
 *   "planId": number  // Sync specific plan, or omit to sync all active plans
 * }
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "result": PayPalPlanSyncResult,  // For single plan sync
 *   "results": PayPalPlanSyncResult[],  // For all plans sync
 *   "summary": {
 *     "total": number,
 *     "successful": number,
 *     "failed": number
 *   }
 * }
 *
 * HOW IT WORKS:
 * - Fetches plan(s) from database
 * - For each plan, creates or updates PayPal billing plan
 * - If plan price/interval changed, creates NEW PayPal plan (to protect existing subscribers)
 * - Updates database with PayPal plan IDs
 *
 * IMPORTANT NOTES:
 * - Only super admins can trigger this sync
 * - Creating a new plan when price changes prevents affecting existing subscribers
 * - PayPal plans are created in ACTIVE status and ready for subscriptions
 */

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { syncPlanWithPayPal, syncAllPlansWithPayPal, type PlanToSyncWithPayPal } from "@/lib/paypal-plans";

export const runtime = "edge";

interface SyncRequestBody {
	planId?: number;
}

export async function POST(request: Request): Promise<NextResponse> {
	try {
		// Check super admin authorization
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json(
				{ error: "Forbidden. Super Admin access required to sync PayPal plans." },
				{ status: 403 }
			);
		}

		// Parse request body (optional planId)
		const body = (await request.json().catch(() => ({}))) as SyncRequestBody;

		// Get environment
		const env = getRequestContext().env as {
			DATABASE: D1Database;
			PAYPAL_CLIENT_ID?: string;
			PAYPAL_CLIENT_SECRET?: string;
			PAYPAL_API_BASE?: string;
			PAYPAL_PRODUCT_ID?: string;
		};

		const db = env.DATABASE;

		// Sync single plan or all plans
		if (body.planId) {
			// Sync specific plan
			const plan = await db
				.prepare(
					`
					SELECT
						id,
						name,
						description,
						price,
						currency,
						billing_period,
						paypal_plan_id as paypalPlanId
					FROM plans
					WHERE id = ?
				`
				)
				.bind(body.planId)
				.first<PlanToSyncWithPayPal>();

			if (!plan) {
				return NextResponse.json({ error: "Plan not found" }, { status: 404 });
			}

			console.log(`[PayPal Sync API] Syncing plan ${body.planId} (${plan.name})`);

			const result = await syncPlanWithPayPal(plan, env);

			if (!result.success) {
				return NextResponse.json(
					{
						success: false,
						error: result.error || "Failed to sync plan with PayPal",
						result,
					},
					{ status: 500 }
				);
			}

			return NextResponse.json({
				success: true,
				result,
				message: `Successfully synced plan "${plan.name}" with PayPal`,
			});
		} else {
			// Sync all active plans
			console.log("[PayPal Sync API] Syncing all active plans");

			const results = await syncAllPlansWithPayPal(env);

			const successCount = results.filter((r) => r.success).length;
			const failedCount = results.length - successCount;

			return NextResponse.json({
				success: true,
				results,
				summary: {
					total: results.length,
					successful: successCount,
					failed: failedCount,
				},
				message: `Synced ${successCount}/${results.length} plan(s) with PayPal`,
			});
		}
	} catch (error: any) {
		console.error("[PayPal Sync API] Error syncing plans:", error);
		return NextResponse.json(
			{
				error: error?.message || "Failed to sync plans with PayPal",
				details: error?.stack,
			},
			{ status: 500 }
		);
	}
}
