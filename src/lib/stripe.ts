import Stripe from "stripe";

/**
 * Stripe client instance
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
	apiVersion: "2025-10-29.clover",
	typescript: true,
});

/**
 * Get the app URL for redirects
 */
export function getAppUrl(): string {
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL;
	}

	// Fallback for local development
	if (process.env.NODE_ENV === "development") {
		return "http://localhost:3000";
	}

	// Production fallback
	return "https://your-app.pages.dev";
}
