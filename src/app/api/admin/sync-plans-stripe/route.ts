import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { syncAllPlansWithStripe, syncPlanWithStripe } from "@/lib/stripe-plans";
import { getCloudflareContext } from "@opennextjs/cloudflare";


interface SyncRequestBody {
	planId?: number; // If provided, sync only this plan
}

/**
 * POST /api/admin/sync-plans-stripe
 * Sync plans with Stripe (create products and prices)
 * Requires super admin access
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		// Check authentication and authorization
		const session = await auth();
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
		}

		// Parse request body
		const body = await request.json().catch(() => ({})) as SyncRequestBody;

		// Sync single plan or all plans
		if (body.planId) {
			// Sync single plan
			const env = getCloudflareContext().env;
			const db = env.DATABASE as D1Database;

			const plan = await db
				.prepare(
					`
					SELECT
						id,
						name,
						description,
						price,
						currency,
						billing_period as billingPeriod,
						stripe_product_id as stripeProductId,
						stripe_price_id as stripePriceId
					FROM plans
					WHERE id = ?
				`
				)
				.bind(body.planId)
				.first<{
					id: number;
					name: string;
					description: string | null;
					price: number;
					currency: string;
					billingPeriod: string;
					stripeProductId: string | null;
					stripePriceId: string | null;
				}>();

			if (!plan) {
				return NextResponse.json({ error: "Plan not found" }, { status: 404 });
			}

			const result = await syncPlanWithStripe(plan);

			return NextResponse.json({
				success: true,
				message: result.success
					? `Successfully synced plan: ${result.planName}`
					: `Failed to sync plan: ${result.error}`,
				result,
			});
		} else {
			// Sync all plans
			const results = await syncAllPlansWithStripe();

			const successCount = results.filter(r => r.success).length;
			const failureCount = results.filter(r => !r.success).length;

			return NextResponse.json({
				success: true,
				message: `Synced ${successCount} plans successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
				results,
				summary: {
					total: results.length,
					successful: successCount,
					failed: failureCount,
				},
			});
		}
	} catch (error: any) {
		console.error("Error syncing plans with Stripe:", error);
		return NextResponse.json(
			{ error: error?.message || "Failed to sync plans with Stripe" },
			{ status: 500 }
		);
	}
}
