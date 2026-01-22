import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getOrderById, getOrderItems } from "@/lib/orders";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * GET /api/orders/[id]
 * Get details of a specific order
 */
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	try {
		const { id } = await params;
		const orderId = parseInt(id);

		if (isNaN(orderId)) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
		}

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

		// Get order
		const order = await getOrderById(orderId);

		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Verify order belongs to user
		if (order.userId !== user.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Get order items
		const items = await getOrderItems(orderId);

		return NextResponse.json({
			order: {
				...order,
				items,
			},
		});
	} catch (error: any) {
		console.error("Error fetching order:", error);
		return NextResponse.json(
			{ error: error?.message ?? "Failed to fetch order" },
			{ status: 500 }
		);
	}
}
