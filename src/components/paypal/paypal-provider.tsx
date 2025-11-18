"use client";

import { PayPalScriptProvider, ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import { ReactNode } from "react";

/**
 * PayPal Script Provider Wrapper
 *
 * Wraps the application (or subscription pages) with PayPal's script provider.
 * This enables the use of PayPal buttons and other PayPal components.
 *
 * Environment Variables Required (client-side):
 * - NEXT_PUBLIC_PAYPAL_CLIENT_ID: Your PayPal application client ID
 *
 * Usage:
 * ```tsx
 * // In a layout or page that needs PayPal functionality
 * import { PayPalProvider } from "@/components/paypal/paypal-provider";
 *
 * export default function SubscriptionLayout({ children }: { children: ReactNode }) {
 *   return <PayPalProvider>{children}</PayPalProvider>;
 * }
 * ```
 *
 * For subscription flows, configure with:
 * - intent: "subscription" (required for subscription buttons)
 * - vault: true (enables saving payment methods)
 */

interface PayPalProviderProps {
	children: ReactNode;
	/**
	 * Override default PayPal client ID
	 * Defaults to NEXT_PUBLIC_PAYPAL_CLIENT_ID
	 */
	clientId?: string;
	/**
	 * Currency code (default: USD)
	 */
	currency?: string;
}

export function PayPalProvider({ children, clientId, currency = "USD" }: PayPalProviderProps) {
	// Get client ID from props or environment
	const paypalClientId = clientId || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

	if (!paypalClientId) {
		console.error("[PayPal Provider] ERROR: NEXT_PUBLIC_PAYPAL_CLIENT_ID is not set.");
		console.error("[PayPal Provider] Available env vars:", {
			hasClientId: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
			nodeEnv: process.env.NODE_ENV,
		});
		return (
			<div className="rounded-md bg-red-50 p-4">
				<p className="text-sm text-red-800">
					PayPal is not configured. Please contact support.
				</p>
				<p className="text-xs text-red-600 mt-2">
					Error: NEXT_PUBLIC_PAYPAL_CLIENT_ID environment variable is missing.
				</p>
			</div>
		);
	}

	console.log("[PayPal Provider] Initializing with client ID:", paypalClientId.substring(0, 10) + "...");

	// PayPal SDK options optimized for subscriptions
	const options: ReactPayPalScriptOptions = {
		clientId: paypalClientId,
		intent: "subscription", // Required for subscription buttons
		vault: true, // Enable payment method vault for recurring payments
		currency,
		// Disable funding sources we don't want to show
		// Remove any of these if you want to enable them
		// disableFunding: "credit,card",
	};

	return <PayPalScriptProvider options={options}>{children}</PayPalScriptProvider>;
}
