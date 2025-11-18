"use client";

import { useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { OnApproveData, OnApproveActions, CreateSubscriptionActions } from "@paypal/paypal-js";

/**
 * PayPal Subscription Button Component
 *
 * Renders PayPal subscription buttons and handles the subscription creation flow.
 *
 * This component must be wrapped in a PayPalProvider to work.
 *
 * Usage:
 * ```tsx
 * import { PayPalProvider } from "@/components/paypal/paypal-provider";
 * import { PayPalSubscriptionButton } from "@/components/paypal/paypal-subscription-button";
 *
 * export default function SubscriptionPage() {
 *   return (
 *     <PayPalProvider>
 *       <PayPalSubscriptionButton
 *         planId={1}
 *         paypalPlanId="P-XXXXXXXXXX"
 *         onSuccess={(subscriptionId) => {
 *           console.log("Subscription created:", subscriptionId);
 *         }}
 *       />
 *     </PayPalProvider>
 *   );
 * }
 * ```
 */

interface PayPalSubscriptionButtonProps {
	/**
	 * Internal plan ID from your database
	 */
	planId: number;
	/**
	 * PayPal subscription plan ID (format: P-XXXXXX)
	 * Can be passed as prop or will use PAYPAL_SUBSCRIPTION_PLAN_ID env var
	 */
	paypalPlanId?: string;
	/**
	 * Callback when subscription is successfully created
	 */
	onSuccess?: (subscriptionId: string) => void;
	/**
	 * Callback when an error occurs
	 */
	onError?: (error: string) => void;
	/**
	 * Custom CSS class for the container
	 */
	className?: string;
}

export function PayPalSubscriptionButton({
	planId,
	paypalPlanId,
	onSuccess,
	onError,
	className = "",
}: PayPalSubscriptionButtonProps) {
	const [{ isPending, isResolved }] = usePayPalScriptReducer();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	/**
	 * Create subscription on PayPal
	 * This is called when the user clicks the PayPal button
	 */
	const createSubscription = async (
		data: Record<string, unknown>,
		actions: CreateSubscriptionActions
	): Promise<string> => {
		try {
			setError(null);

			// Get PayPal plan ID from props or server
			let planIdToUse = paypalPlanId;

			if (!planIdToUse) {
				// Fetch plan-specific PayPal plan ID from database
				const response = await fetch(`/api/paypal/plan-id?planId=${planId}`);
				if (!response.ok) {
					const errorData = (await response.json()) as { error?: string; details?: string };
					throw new Error(
						errorData.details || errorData.error || "Failed to get PayPal plan ID. Plan may not be synced."
					);
				}
				const config = (await response.json()) as { paypalPlanId?: string; error?: string };
				planIdToUse = config.paypalPlanId;
			}

			if (!planIdToUse) {
				throw new Error("PayPal plan ID not configured. Please contact support or try syncing plans.");
			}

			// Create subscription using PayPal SDK
			return actions.subscription.create({
				plan_id: planIdToUse,
			});
		} catch (err: any) {
			const errorMessage = err.message || "Failed to create subscription";
			setError(errorMessage);
			onError?.(errorMessage);
			throw err;
		}
	};

	/**
	 * Handle subscription approval
	 * This is called after the user approves the subscription on PayPal
	 */
	const onApprove = async (data: OnApproveData, actions: OnApproveActions): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			const subscriptionId = data.subscriptionID;

			if (!subscriptionId) {
				throw new Error("No subscription ID returned from PayPal");
			}

			console.log("[PayPal] Subscription approved:", subscriptionId);

			// Call our backend to verify and attach the subscription
			const response = await fetch("/api/paypal/subscription/attach", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					subscriptionId,
					planId,
				}),
			});

			if (!response.ok) {
				const errorData = (await response.json()) as { error?: string; details?: string };
				throw new Error(errorData.error || errorData.details || "Failed to attach subscription");
			}

			const result = await response.json();

			console.log("[PayPal] Subscription attached successfully:", result);

			setSuccessMessage("Subscription activated successfully!");
			onSuccess?.(subscriptionId);

			// Redirect to success page after a brief delay
			setTimeout(() => {
				window.location.href = "/billing/success?provider=paypal";
			}, 2000);
		} catch (err: any) {
			const errorMessage = err.message || "Failed to process subscription";
			console.error("[PayPal] Error in onApprove:", err);
			setError(errorMessage);
			onError?.(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle subscription cancellation
	 * Called when user closes the PayPal popup without completing
	 */
	const onCancel = (): void => {
		console.log("[PayPal] User canceled the subscription flow");
		setError(null);
		setSuccessMessage(null);
	};

	/**
	 * Handle PayPal SDK errors
	 */
	const onPayPalError = (err: Record<string, unknown>): void => {
		const errorMessage = "PayPal encountered an error. Please try again.";
		console.error("[PayPal] SDK error:", err);
		setError(errorMessage);
		onError?.(errorMessage);
	};

	// Show loading state while PayPal SDK is loading
	if (isPending) {
		return (
			<div className={`flex items-center justify-center p-8 ${className}`}>
				<div className="flex items-center gap-3">
					<div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
					<p className="text-sm text-gray-600">Loading PayPal...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={className}>
			{/* Error message */}
			{error && (
				<div className="mb-4 rounded-md bg-red-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-red-400"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">Subscription Error</h3>
							<p className="mt-1 text-sm text-red-700">{error}</p>
						</div>
					</div>
				</div>
			)}

			{/* Success message */}
			{successMessage && (
				<div className="mb-4 rounded-md bg-green-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-green-400"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-green-800">Success!</h3>
							<p className="mt-1 text-sm text-green-700">{successMessage}</p>
						</div>
					</div>
				</div>
			)}

			{/* Loading overlay while processing */}
			{loading && (
				<div className="mb-4 rounded-md bg-blue-50 p-4">
					<div className="flex items-center gap-3">
						<div className="h-5 w-5 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600" />
						<p className="text-sm text-blue-800">Processing your subscription...</p>
					</div>
				</div>
			)}

			{/* PayPal Buttons */}
			{isResolved && (
				<PayPalButtons
					style={{
						layout: "vertical",
						color: "gold",
						shape: "rect",
						label: "subscribe",
					}}
					createSubscription={createSubscription}
					onApprove={onApprove}
					onCancel={onCancel}
					onError={onPayPalError}
					disabled={loading}
				/>
			)}
		</div>
	);
}
