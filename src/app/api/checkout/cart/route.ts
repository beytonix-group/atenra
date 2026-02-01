import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getStripe, getAppUrl } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
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

interface CheckoutRequest {
	couponCode?: string;
}

/**
 * POST /api/checkout/cart
 * Create a Stripe checkout session for cart items (one-time payment)
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		const stripe = getStripe();

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
				SELECT id, order_number, stripe_checkout_session_id
				FROM orders
				WHERE user_id = ? AND status = 'pending' AND created_at > ? AND stripe_checkout_session_id IS NOT NULL
				ORDER BY created_at DESC LIMIT 1
			`
			)
			.bind(user.id, oneHourAgo)
			.first<{ id: number; order_number: string; stripe_checkout_session_id: string }>();

		if (existingOrder?.stripe_checkout_session_id) {
			// Try to retrieve the existing session
			try {
				const existingSession = await stripe.checkout.sessions.retrieve(existingOrder.stripe_checkout_session_id);
				// Only return existing session if it's still open
				if (existingSession.status === "open" && existingSession.url) {
					console.log(`[Checkout] Reusing existing session ${existingOrder.stripe_checkout_session_id} for user ${user.id}`);
					return NextResponse.json({
						url: existingSession.url,
						orderId: existingOrder.id,
						orderNumber: existingOrder.order_number,
						reused: true,
					});
				}
				// Session exists but not open - safe to create new one
				console.log(`[Checkout] Existing session ${existingOrder.stripe_checkout_session_id} status: ${existingSession.status}, creating new session`);
			} catch (sessionError: any) {
				// Log the error for debugging
				console.error(`[Checkout] Failed to retrieve existing Stripe session ${existingOrder.stripe_checkout_session_id}:`, sessionError?.message);
				// Only continue for "resource not found" errors (expired/deleted sessions)
				// For auth failures, network issues, etc., surface the error to avoid duplicate charges
				const isNotFoundError = sessionError?.code === 'resource_missing' || sessionError?.statusCode === 404;
				if (!isNotFoundError) {
					return NextResponse.json(
						{ error: "Unable to verify existing checkout session. Please try again." },
						{ status: 503 }
					);
				}
				// Session truly doesn't exist, safe to create new one
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
		let body: CheckoutRequest = {};
		try {
			body = await request.json() as CheckoutRequest;
		} catch {
			console.warn(`[Checkout] Failed to parse request body for user ${user.id}, proceeding without coupon`);
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
				paymentProvider: 'stripe',
			}
		);

		// Get or create Stripe customer
		let customerId: string;
		try {
			customerId = await getOrCreateStripeCustomer(user.id);
		} catch (customerError: any) {
			console.error("Error creating Stripe customer:", customerError);
			return NextResponse.json(
				{ error: "Unable to set up payment. Please try again." },
				{ status: 500 }
			);
		}

		// Create Stripe Checkout Session for one-time payment
		const appUrl = getAppUrl();

		// Build line items for Stripe
		const lineItems = cartItems.map(item => ({
			price_data: {
				currency: 'usd',
				product_data: {
					name: item.title,
					description: item.description || undefined,
				},
				unit_amount: item.unitPriceCents!,
			},
			quantity: item.quantity,
		}));

		// Note: Stripe doesn't support negative line items for discounts.
		// When discount functionality is implemented, use Stripe's discounts
		// array with coupons created via the Stripe API.
		// For now, discounts return 0 so this is a placeholder for future.

		const checkoutSession = await stripe.checkout.sessions.create({
			customer: customerId,
			mode: "payment",
			line_items: lineItems,
			success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${appUrl}/checkout/cancel`,
			metadata: {
				order_id: orderId.toString(),
				user_id: user.id.toString(),
				order_number: orderNumber,
			},
			payment_intent_data: {
				metadata: {
					order_id: orderId.toString(),
					user_id: user.id.toString(),
					order_number: orderNumber,
				},
			},
		});

		// Update order with Stripe session ID
		await updateOrderStatus(orderId, 'pending', {
			stripeCheckoutSessionId: checkoutSession.id,
		});

		return NextResponse.json({
			url: checkoutSession.url,
			orderId,
			orderNumber,
			totals,
		});
	} catch (error: any) {
		console.error("Error creating checkout session:", error);
		return NextResponse.json(
			{
				error: "Failed to create checkout session",
				...(process.env.NODE_ENV === "development" && { details: error?.message }),
			},
			{ status: 500 }
		);
	}
}
