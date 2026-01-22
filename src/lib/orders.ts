/**
 * Order Helper Functions
 *
 * Utilities for creating and managing one-time cart orders.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Generate a unique order number
 * Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20240122-A7B3C)
 */
export function generateOrderNumber(): string {
	const now = new Date();
	const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
	const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
	return `ORD-${datePart}-${randomPart}`;
}

/**
 * Calculate order totals from cart items
 */
export function calculateOrderTotals(items: Array<{
	quantity: number;
	unitPriceCents: number | null;
}>, discountCents: number = 0, taxCents: number = 0): {
	subtotalCents: number;
	discountCents: number;
	taxCents: number;
	totalCents: number;
} {
	const subtotalCents = items.reduce((sum, item) => {
		return sum + ((item.unitPriceCents ?? 0) * item.quantity);
	}, 0);

	const totalCents = Math.max(0, subtotalCents - discountCents + taxCents);

	return {
		subtotalCents,
		discountCents,
		taxCents,
		totalCents,
	};
}

/**
 * Order status type
 */
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

/**
 * Create a new order from cart items
 */
export async function createOrderFromCart(
	userId: number,
	cartItems: Array<{
		id: number;
		title: string;
		description: string | null;
		quantity: number;
		unitPriceCents: number | null;
	}>,
	options: {
		discountCents?: number;
		discountType?: 'membership' | 'agent' | 'coupon' | null;
		discountReason?: string | null;
		couponCodeId?: number | null;
		taxCents?: number;
		currency?: string;
		paymentProvider?: 'stripe' | 'paypal';
		metadata?: Record<string, any>;
	} = {}
): Promise<{
	orderId: number;
	orderNumber: string;
	totals: {
		subtotalCents: number;
		discountCents: number;
		taxCents: number;
		totalCents: number;
	};
}> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const orderNumber = generateOrderNumber();
	const totals = calculateOrderTotals(
		cartItems,
		options.discountCents ?? 0,
		options.taxCents ?? 0
	);

	const now = Math.floor(Date.now() / 1000);

	// Insert order
	const orderResult = await db
		.prepare(
			`
			INSERT INTO orders (
				user_id,
				order_number,
				status,
				subtotal_cents,
				discount_cents,
				discount_type,
				discount_reason,
				coupon_code_id,
				tax_cents,
				total_cents,
				currency,
				payment_provider,
				metadata,
				created_at,
				updated_at
			) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
		)
		.bind(
			userId,
			orderNumber,
			totals.subtotalCents,
			totals.discountCents,
			options.discountType ?? null,
			options.discountReason ?? null,
			options.couponCodeId ?? null,
			totals.taxCents,
			totals.totalCents,
			options.currency ?? 'usd',
			options.paymentProvider ?? null,
			options.metadata ? JSON.stringify(options.metadata) : null,
			now,
			now
		)
		.run();

	const orderId = orderResult.meta.last_row_id as number;

	// Insert order items
	for (const item of cartItems) {
		const itemTotal = (item.unitPriceCents ?? 0) * item.quantity;

		await db
			.prepare(
				`
				INSERT INTO order_items (
					order_id,
					title,
					description,
					quantity,
					unit_price_cents,
					discount_cents,
					total_cents,
					cart_item_id,
					created_at
				) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
			`
			)
			.bind(
				orderId,
				item.title,
				item.description,
				item.quantity,
				item.unitPriceCents ?? 0,
				itemTotal,
				item.id,
				now
			)
			.run();
	}

	return {
		orderId,
		orderNumber,
		totals,
	};
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: number): Promise<{
	id: number;
	userId: number;
	orderNumber: string;
	status: OrderStatus;
	subtotalCents: number;
	discountCents: number;
	discountType: string | null;
	discountReason: string | null;
	couponCodeId: number | null;
	taxCents: number;
	totalCents: number;
	currency: string;
	paymentProvider: string | null;
	stripeCheckoutSessionId: string | null;
	stripePaymentIntentId: string | null;
	paypalOrderId: string | null;
	paypalCaptureId: string | null;
	metadata: string | null;
	createdAt: number;
	updatedAt: number;
	completedAt: number | null;
} | null> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	return db
		.prepare(
			`
			SELECT
				id,
				user_id as userId,
				order_number as orderNumber,
				status,
				subtotal_cents as subtotalCents,
				discount_cents as discountCents,
				discount_type as discountType,
				discount_reason as discountReason,
				coupon_code_id as couponCodeId,
				tax_cents as taxCents,
				total_cents as totalCents,
				currency,
				payment_provider as paymentProvider,
				stripe_checkout_session_id as stripeCheckoutSessionId,
				stripe_payment_intent_id as stripePaymentIntentId,
				paypal_order_id as paypalOrderId,
				paypal_capture_id as paypalCaptureId,
				metadata,
				created_at as createdAt,
				updated_at as updatedAt,
				completed_at as completedAt
			FROM orders
			WHERE id = ?
		`
		)
		.bind(orderId)
		.first();
}

/**
 * Get order by Stripe checkout session ID
 */
export async function getOrderByStripeSessionId(sessionId: string): Promise<{
	id: number;
	userId: number;
	orderNumber: string;
	status: OrderStatus;
	totalCents: number;
} | null> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	return db
		.prepare(
			`
			SELECT
				id,
				user_id as userId,
				order_number as orderNumber,
				status,
				total_cents as totalCents
			FROM orders
			WHERE stripe_checkout_session_id = ?
		`
		)
		.bind(sessionId)
		.first();
}

/**
 * Get order by PayPal order ID
 */
export async function getOrderByPayPalOrderId(paypalOrderId: string): Promise<{
	id: number;
	userId: number;
	orderNumber: string;
	status: OrderStatus;
	totalCents: number;
} | null> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	return db
		.prepare(
			`
			SELECT
				id,
				user_id as userId,
				order_number as orderNumber,
				status,
				total_cents as totalCents
			FROM orders
			WHERE paypal_order_id = ?
		`
		)
		.bind(paypalOrderId)
		.first();
}

/**
 * Update order status
 */
export async function updateOrderStatus(
	orderId: number,
	status: OrderStatus,
	additionalFields?: {
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
		paypalOrderId?: string;
		paypalCaptureId?: string;
		completedAt?: number;
	}
): Promise<void> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const now = Math.floor(Date.now() / 1000);

	let sql = `UPDATE orders SET status = ?, updated_at = ?`;
	const params: (string | number | null)[] = [status, now];

	if (additionalFields?.stripeCheckoutSessionId) {
		sql += `, stripe_checkout_session_id = ?`;
		params.push(additionalFields.stripeCheckoutSessionId);
	}

	if (additionalFields?.stripePaymentIntentId) {
		sql += `, stripe_payment_intent_id = ?`;
		params.push(additionalFields.stripePaymentIntentId);
	}

	if (additionalFields?.paypalOrderId) {
		sql += `, paypal_order_id = ?`;
		params.push(additionalFields.paypalOrderId);
	}

	if (additionalFields?.paypalCaptureId) {
		sql += `, paypal_capture_id = ?`;
		params.push(additionalFields.paypalCaptureId);
	}

	if (additionalFields?.completedAt !== undefined) {
		sql += `, completed_at = ?`;
		params.push(additionalFields.completedAt);
	}

	sql += ` WHERE id = ?`;
	params.push(orderId);

	await db.prepare(sql).bind(...params).run();
}

/**
 * Get orders for a user
 */
export async function getUserOrders(
	userId: number,
	options: {
		limit?: number;
		offset?: number;
		status?: OrderStatus;
	} = {}
): Promise<Array<{
	id: number;
	orderNumber: string;
	status: OrderStatus;
	totalCents: number;
	currency: string;
	paymentProvider: string | null;
	createdAt: number;
	completedAt: number | null;
	itemCount: number;
}>> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	let sql = `
		SELECT
			o.id,
			o.order_number as orderNumber,
			o.status,
			o.total_cents as totalCents,
			o.currency,
			o.payment_provider as paymentProvider,
			o.created_at as createdAt,
			o.completed_at as completedAt,
			(SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as itemCount
		FROM orders o
		WHERE o.user_id = ?
	`;
	const params: (string | number)[] = [userId];

	if (options.status) {
		sql += ` AND o.status = ?`;
		params.push(options.status);
	}

	sql += ` ORDER BY o.created_at DESC`;

	if (options.limit) {
		sql += ` LIMIT ?`;
		params.push(options.limit);

		if (options.offset) {
			sql += ` OFFSET ?`;
			params.push(options.offset);
		}
	}

	const result = await db.prepare(sql).bind(...params).all();
	return (result.results || []) as any;
}

/**
 * Get order items for an order
 */
export async function getOrderItems(orderId: number): Promise<Array<{
	id: number;
	title: string;
	description: string | null;
	quantity: number;
	unitPriceCents: number;
	discountCents: number;
	totalCents: number;
}>> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	const result = await db
		.prepare(
			`
			SELECT
				id,
				title,
				description,
				quantity,
				unit_price_cents as unitPriceCents,
				discount_cents as discountCents,
				total_cents as totalCents
			FROM order_items
			WHERE order_id = ?
			ORDER BY id
		`
		)
		.bind(orderId)
		.all();

	return (result.results || []) as any;
}

/**
 * Clear cart items for a user after successful order
 */
export async function clearUserCart(userId: number): Promise<void> {
	const env = getCloudflareContext().env;
	const db = env.DATABASE as D1Database;

	await db
		.prepare(`DELETE FROM cart_items WHERE user_id = ?`)
		.bind(userId)
		.run();
}
