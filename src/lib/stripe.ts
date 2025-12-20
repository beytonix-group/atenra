import Stripe from "stripe";
import { getCloudflareContext } from "@opennextjs/cloudflare";

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe secret key from environment
 * Handles both Cloudflare Workers (via context) and local dev (via process.env)
 */
function getStripeSecretKey(): string {
	try {
		// Try Cloudflare context first (for Workers environment)
		const context = getCloudflareContext();
		console.log("[Stripe] Cloudflare context available:", !!context);
		console.log("[Stripe] context.env available:", !!context?.env);

		if (context?.env && typeof context.env === 'object') {
			const hasKey = 'STRIPE_SECRET_KEY' in context.env;
			console.log("[Stripe] STRIPE_SECRET_KEY in env:", hasKey);

			if (hasKey) {
				const secret = (context.env as any).STRIPE_SECRET_KEY;
				console.log("[Stripe] Secret type:", typeof secret, "Length:", secret?.length || 0);
				if (typeof secret === 'string' && secret.length > 0) {
					console.log("[Stripe] Using secret from Cloudflare context");
					return secret;
				}
			}
		}
	} catch (error) {
		console.log("[Stripe] Error getting Cloudflare context:", error);
		// Not in Cloudflare context, fall through to process.env
	}

	// Fallback to process.env (for local development)
	const envSecret = process.env.STRIPE_SECRET_KEY || "";
	console.log("[Stripe] Falling back to process.env, has secret:", !!envSecret);
	return envSecret;
}

/**
 * Get Stripe client instance lazily
 * This ensures the secret key is available at runtime, not module load time
 * The instance is memoized for performance
 */
export function getStripe(): Stripe {
	if (stripeInstance) {
		return stripeInstance;
	}

	const secretKey = getStripeSecretKey();
	if (!secretKey) {
		throw new Error("STRIPE_SECRET_KEY is not configured");
	}
	stripeInstance = new Stripe(secretKey, {
		apiVersion: "2025-10-29.clover",
		typescript: true,
		// Use fetch-based HTTP client for Cloudflare Workers compatibility
		httpClient: Stripe.createFetchHttpClient(),
	});
	return stripeInstance;
}

/**
 * Legacy export for backwards compatibility
 * WARNING: This may not work on Cloudflare Workers - use getStripe() instead
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
	apiVersion: "2025-10-29.clover",
	typescript: true,
});

/**
 * Get the app URL for redirects
 */
export function getAppUrl(): string {
	// Try Cloudflare context first
	try {
		const context = getCloudflareContext();
		if (context?.env && typeof context.env === 'object' && 'NEXT_PUBLIC_APP_URL' in context.env) {
			const url = (context.env as any).NEXT_PUBLIC_APP_URL;
			if (typeof url === 'string') {
				return url;
			}
		}
	} catch {
		// Not in Cloudflare context
	}

	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL;
	}

	// Fallback for local development
	if (process.env.NODE_ENV === "development") {
		return "http://localhost:3000";
	}

	// Production fallback
	return "https://atenra.com";
}
