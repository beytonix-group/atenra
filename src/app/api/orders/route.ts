import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getUserOrders } from "@/lib/orders";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * GET /api/orders
 * Get list of orders for the current user
 */
export async function GET(request: Request): Promise<NextResponse> {
	try {
		// Require authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user ID from database
		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		const user = await db
			.prepare(
				`
				SELECT id
				FROM users
				WHERE auth_user_id = ?
			`
			)
			.bind(session.user.id)
			.first<{ id: number }>();

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Parse query parameters
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get("limit") || "20");
		const offset = parseInt(url.searchParams.get("offset") || "0");
		const status = url.searchParams.get("status") as any;

		// Get orders
		const orders = await getUserOrders(user.id, {
			limit: Math.min(limit, 100),
			offset,
			status,
		});

		return NextResponse.json({
			orders,
			pagination: {
				limit,
				offset,
				hasMore: orders.length === limit,
			},
		});
	} catch (error: any) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ error: error?.message ?? "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}
