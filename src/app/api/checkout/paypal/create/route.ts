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

		// Rate limiting
		const rateLimitResult = checkRateLimit(`checkout:${session.user.id}`, RATE_LIMITS.checkout);
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ error: "Too many checkout attempts. Please wait before trying again." },
				{
					status: 429,
					headers: {
						"Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
					},
				}
			);
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

		// Check for existing pending order within the last hour (deduplication)
		const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
		const existingOrder = await db
			.prepare(
				`
				SELECT id, order_number, paypal_order_id
				FROM orders
				WHERE user_id = ? AND status = 'pending' AND created_at > ? AND paypal_order_id IS NOT NULL
				ORDER BY created_at DESC LIMIT 1
			`
			)
			.bind(user.id, oneHourAgo)
			.first<{ id: number; order_number: string; paypal_order_id: string }>();

		if (existingOrder?.paypal_order_id) {
			// Try to check if existing PayPal order is still valid
			try {
				const existingPayPalOrder = await getPayPalOrderDetails(env as any, existingOrder.paypal_order_id);
				// Only return existing order if it's still awaiting approval
				if (existingPayPalOrder.status === "CREATED" || existingPayPalOrder.status === "PAYER_ACTION_REQUIRED") {
					const approvalLink = existingPayPalOrder.links.find(link => link.rel === "approve");
					if (approvalLink) {
						console.log(`[PayPal Checkout] Reusing existing order ${existingOrder.paypal_order_id} for user ${user.id}`);
						return NextResponse.json({
							approvalUrl: approvalLink.href,
							orderId: existingOrder.id,
							orderNumber: existingOrder.order_number,
							paypalOrderId: existingOrder.paypal_order_id,
							reused: true,
						});
					}
				}
				// Order exists but not awaiting approval - safe to create new one
				console.log(`[PayPal Checkout] Existing order ${existingOrder.paypal_order_id} status: ${existingPayPalOrder.status}, creating new order`);
			} catch (orderError: any) {
				// Log the error for debugging
				console.error(`[PayPal Checkout] Failed to verify existing PayPal order ${existingOrder.paypal_order_id}:`, orderError?.message);
				// Check if this is a "not found" error vs something more serious
				const isNotFoundError = orderError?.message?.includes('404') || orderError?.message?.toLowerCase().includes('not found');
				if (!isNotFoundError) {
					// This could be auth failure, network issue, or PayPal outage
					// Creating a new order could result in duplicate charges
					return NextResponse.json(
						{ error: "Unable to verify existing payment session. Please try again." },
						{ status: 503 }
					);
				}
				// Order truly doesn't exist, safe to create new one
			}
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

		// Parse request body (coupon code is optional, so we log but don't fail on parse errors)
		let body: CreatePayPalOrderRequest = {};
		try {
			body = await request.json() as CreatePayPalOrderRequest;
		} catch (parseError) {
			console.warn(`[PayPal Checkout] Failed to parse request body for user ${user.id}, proceeding without coupon`);
		}

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
			{
				error: "Failed to create PayPal order",
				...(process.env.NODE_ENV === "development" && { details: error?.message }),
			},
			{ status: 500 }
		);
	}
}
