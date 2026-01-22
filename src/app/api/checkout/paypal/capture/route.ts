import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { capturePayPalOrder } from "@/lib/paypal";
import { getOrderByPayPalOrderId, updateOrderStatus, clearUserCart } from "@/lib/orders";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * GET /api/checkout/paypal/capture
 * Capture a PayPal payment after user approval
 * This is called when PayPal redirects back with the token
 */
export async function GET(request: Request): Promise<NextResponse> {
	try {
		const url = new URL(request.url);
		const token = url.searchParams.get("token");

		if (!token) {
			return NextResponse.redirect(new URL("/checkout/cancel", request.url));
		}

		// Require authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		// Get environment
		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		// Get user ID
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
			return NextResponse.redirect(new URL("/checkout/cancel", request.url));
		}

		// Find order by PayPal order ID
		const order = await getOrderByPayPalOrderId(token);
		if (!order) {
			console.error(`[PayPal Capture] Order not found for PayPal order ID: ${token}`);
			return NextResponse.redirect(new URL("/checkout/cancel", request.url));
		}

		// Verify order belongs to user
		if (order.userId !== user.id) {
			console.error(`[PayPal Capture] Order ${order.id} does not belong to user ${user.id}`);
			return NextResponse.redirect(new URL("/checkout/cancel", request.url));
		}

		// Check if already completed
		if (order.status === "completed") {
			console.log(`[PayPal Capture] Order ${order.id} already completed`);
			return NextResponse.redirect(new URL(`/checkout/success?order=${order.orderNumber}`, request.url));
		}

		// Capture the payment
		const capture = await capturePayPalOrder(env as any, token);

		if (capture.status !== "COMPLETED") {
			console.error(`[PayPal Capture] Capture failed with status: ${capture.status}`);
			await updateOrderStatus(order.id, 'failed');
			return NextResponse.redirect(new URL("/checkout/cancel", request.url));
		}

		// Verify captured amount matches expected order total
		if (capture.amountCents !== order.totalCents) {
			console.error(`[PayPal Capture] Amount mismatch: expected ${order.totalCents} cents, got ${capture.amountCents} cents`);
			await updateOrderStatus(order.id, 'failed');
			return NextResponse.redirect(new URL("/checkout/cancel", request.url));
		}

		// Update order status to completed
		const now = Math.floor(Date.now() / 1000);
		await updateOrderStatus(order.id, 'completed', {
			paypalCaptureId: capture.captureId,
			completedAt: now,
		});

		// Clear user's cart
		await clearUserCart(user.id);

		console.log(`[PayPal Capture] Order ${order.id} completed successfully`);

		// Redirect to success page
		return NextResponse.redirect(new URL(`/checkout/success?order=${order.orderNumber}`, request.url));
	} catch (error: any) {
		console.error("Error capturing PayPal payment:", error);
		return NextResponse.redirect(new URL("/checkout/cancel", request.url));
	}
}

/**
 * POST /api/checkout/paypal/capture
 * Alternative endpoint for programmatic capture
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = await request.json() as { paypalOrderId?: string };
		const paypalOrderId = body.paypalOrderId;

		if (!paypalOrderId) {
			return NextResponse.json({ error: "PayPal order ID is required" }, { status: 400 });
		}

		// Require authentication
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get environment
		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		// Get user ID
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

		// Find order by PayPal order ID
		const order = await getOrderByPayPalOrderId(paypalOrderId);
		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		// Verify order belongs to user
		if (order.userId !== user.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Check if already completed
		if (order.status === "completed") {
			return NextResponse.json({
				success: true,
				message: "Order already completed",
				orderNumber: order.orderNumber,
			});
		}

		// Capture the payment
		const capture = await capturePayPalOrder(env as any, paypalOrderId);

		if (capture.status !== "COMPLETED") {
			await updateOrderStatus(order.id, 'failed');
			return NextResponse.json({ error: `Payment capture failed: ${capture.status}` }, { status: 400 });
		}

		// Verify captured amount matches expected order total
		if (capture.amountCents !== order.totalCents) {
			console.error(`[PayPal Capture] Amount mismatch: expected ${order.totalCents} cents, got ${capture.amountCents} cents`);
			await updateOrderStatus(order.id, 'failed');
			return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
		}

		// Update order status to completed
		const now = Math.floor(Date.now() / 1000);
		await updateOrderStatus(order.id, 'completed', {
			paypalCaptureId: capture.captureId,
			completedAt: now,
		});

		// Clear user's cart
		await clearUserCart(user.id);

		return NextResponse.json({
			success: true,
			orderNumber: order.orderNumber,
			captureId: capture.captureId,
		});
	} catch (error: any) {
		console.error("Error capturing PayPal payment:", error);
		return NextResponse.json(
			{ error: error?.message ?? "Failed to capture payment" },
			{ status: 500 }
		);
	}
}
