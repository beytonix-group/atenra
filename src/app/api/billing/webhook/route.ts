import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { handleStripeWebhook } from "@/lib/webhook-handler";
import { getCloudflareContext } from "@opennextjs/cloudflare";


function getWebhookSecret(): string {
	try {
		const context = getCloudflareContext();
		if (context?.env && typeof context.env === 'object' && 'STRIPE_WEBHOOK_SECRET' in context.env) {
			const secret = (context.env as any).STRIPE_WEBHOOK_SECRET;
			if (typeof secret === 'string') {
				return secret;
			}
		}
	} catch {
		// Not in Cloudflare context
	}
	return process.env.STRIPE_WEBHOOK_SECRET || "";
}


/**
 * POST /api/billing/webhook
 * Handle Stripe webhook events with signature verification
 */
export async function POST(request: Request): Promise<NextResponse> {
	try {
		const stripe = getStripe();
		const body = await request.text();
		const signature = request.headers.get("stripe-signature");

		console.log("Webhook received, signature present:", !!signature);

		if (!signature) {
			console.error("Missing Stripe signature header");
			return NextResponse.json({ error: "Missing signature" }, { status: 400 });
		}

		const webhookSecret = getWebhookSecret();
		console.log("Webhook secret configured:", !!webhookSecret);

		if (!webhookSecret) {
			console.error("STRIPE_WEBHOOK_SECRET not configured");
			return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
		}

		// Verify webhook signature (use async version for edge runtime)
		let event: Stripe.Event;
		try {
			event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
			console.log("✅ Webhook signature verified successfully");
		} catch (verificationError: any) {
			console.error("❌ Webhook signature verification failed:", {
				errorType: verificationError?.type,
				errorMessage: verificationError?.message,
				signaturePresent: !!signature,
				bodyLength: body?.length,
				secretConfigured: !!webhookSecret,
			});
			return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
		}

		console.log(`Processing webhook event: ${event.id} (${event.type})`);

		// Handle the event
		await handleStripeWebhook(event);

		return NextResponse.json({ received: true });
	} catch (error: any) {
		console.error("Error processing webhook:", error);
		// Return 500 so Stripe will retry
		return NextResponse.json(
			{
				error: "Internal server error",
				...(process.env.NODE_ENV === "development" && { details: error?.message }),
			},
			{ status: 500 }
		);
	}
}
