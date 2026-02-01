import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { createPayPalOrder, getAppUrl, getPayPalOrderDetails } from "@/lib/paypal";
import { createOrderFromCart, updateOrderStatus } from "@/lib/orders";
import { calculateOrderDiscount } from "@/lib/discounts";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

interface CartItem {
	id: number;
	title: string;
	description: string | null;
	quantity: number;
	unitPriceCents: number | null;
}

interface CreatePayPalOrderRequest {
	couponCode?: string;
}

/**
 * POST /api/checkout/paypal/create
 * Create a PayPal order for cart items (one-time payment)
 */
export async function POST(request: Request): Promise<NextResponse> {
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

		// Get cart items
		const cartResult = await db
			.prepare(
				`
				SELECT
					id,
					title,
					description,
					quantity,
					unit_price_cents as unitPriceCents
				FROM cart_items
				WHERE user_id = ?
				ORDER BY created_at
			`
			)
			.bind(user.id)
			.all<CartItem>();

		const cartItems = cartResult.results || [];

		if (cartItems.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// Check all items have prices
		const itemsWithoutPrices = cartItems.filter(item => item.unitPriceCents === null);
		if (itemsWithoutPrices.length > 0) {
			return NextResponse.json(
				{
					error: "Some items do not have prices set",
					items: itemsWithoutPrices.map(i => i.title)
				},
				{ status: 400 }
			);
		}

		// Parse request body
		const body = await request.json().catch(() => ({})) as CreatePayPalOrderRequest;

		// Calculate subtotal
		const subtotalCents = cartItems.reduce((sum, item) => {
			return sum + ((item.unitPriceCents ?? 0) * item.quantity);
		}, 0);

		// Calculate discount
		const discount = await calculateOrderDiscount(user.id, subtotalCents, body.couponCode);

		// Create order in database (pending status)
		const { orderId, orderNumber, totals } = await createOrderFromCart(
			user.id,
			cartItems,
			{
				discountCents: discount.discountCents,
				discountType: discount.discountType,
				discountReason: discount.discountReason,
				couponCodeId: discount.couponCodeId,
				paymentProvider: 'paypal',
			}
		);

		// Create PayPal Order
		const appUrl = getAppUrl();

		const paypalItems = cartItems.map(item => ({
			name: item.title,
			description: item.description || undefined,
			quantity: item.quantity,
			unitPriceCents: item.unitPriceCents!,
		}));

		const { orderId: paypalOrderId, approvalUrl } = await createPayPalOrder(
			env as any,
			paypalItems,
			totals.totalCents,
			{
				orderId,
				userId: user.id,
				orderNumber,
			},
			`${appUrl}/api/checkout/paypal/capture?token={TOKEN}`,
			`${appUrl}/checkout/cancel`
		);

		// Update order with PayPal order ID
		await updateOrderStatus(orderId, 'pending', {
			paypalOrderId,
		});

		return NextResponse.json({
			approvalUrl,
			orderId,
			orderNumber,
			paypalOrderId,
			totals,
		});
	} catch (error: any) {
		console.error("Error creating PayPal order:", error);
		return NextResponse.json(
			{ error: error?.message ?? "Failed to create PayPal order" },
			{ status: 500 }
		);
	}
}
