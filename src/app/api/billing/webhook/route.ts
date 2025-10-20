import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { handleStripeWebhook } from "@/lib/webhook-handler";

export const runtime = "edge";

/**
 * POST /api/billing/webhook
 * Handle Stripe webhook events with signature verification
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		const body = await request.text();
		const signature = request.headers.get("stripe-signature");

		console.log("Webhook received, signature present:", !!signature);

		if (!signature) {
			console.error("Missing Stripe signature header");
			return NextResponse.json({ error: "Missing signature" }, { status: 400 });
		}

		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
		console.log("Webhook secret configured:", !!webhookSecret, "Length:", webhookSecret?.length);

		if (!webhookSecret) {
			console.error("STRIPE_WEBHOOK_SECRET not configured");
			return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
		}

		// Verify webhook signature (use async version for edge runtime)
		let event: Stripe.Event;
		try {
			event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
			console.log("✅ Webhook signature verified successfully");
		} catch (err: any) {
			console.error("❌ Webhook signature verification failed:", err.message);
			console.error("Webhook secret starts with:", webhookSecret?.substring(0, 10));
			return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
		}

		console.log(`Processing webhook event: ${event.id} (${event.type})`);

		// Handle the event
		await handleStripeWebhook(event);

		return NextResponse.json({ received: true });
	} catch (error: any) {
		console.error("Error processing webhook:", error);
		// Return 500 so Stripe will retry
		return NextResponse.json({ error: error?.message ?? "Internal server error" }, { status: 500 });
	}
}
