"use client";

import { useEffect, useState } from "react";
import { PayPalProvider } from "./paypal-provider";
import { PayPalSubscriptionButton } from "./paypal-subscription-button";

/**
 * Subscription status from API
 */
interface SubscriptionStatus {
	status: "active" | "inactive" | "past_due" | "canceled" | "suspended" | "trialing";
	planSlug?: string;
	plan?: {
		name: string;
		price: number;
		currency: string;
		billing_period: string;
	};
	provider?: "stripe" | "paypal" | "braintree";
	currentPeriodEnd?: number;
	cancelAtPeriodEnd?: boolean;
	canceledAt?: number;
}

/**
 * PayPal Subscription Page Component
 *
 * Displays current subscription status and PayPal subscription button.
 * Handles both cases: user has existing subscription or needs to subscribe.
 */
export function PayPalSubscriptionPage() {
	const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch current subscription status
	useEffect(() => {
		fetchSubscriptionStatus();
	}, []);

	const fetchSubscriptionStatus = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch("/api/billing/subscription");
			if (!response.ok) {
				throw new Error("Failed to fetch subscription status");
			}

			const data = (await response.json()) as SubscriptionStatus;
			setSubscription(data);
		} catch (err: any) {
			console.error("Error fetching subscription:", err);
			setError(err.message || "Failed to load subscription");
		} finally {
			setLoading(false);
		}
	};

	// Handle successful subscription
	const handleSubscriptionSuccess = (subscriptionId: string) => {
		console.log("Subscription created successfully:", subscriptionId);
		// Refresh subscription status
		setTimeout(() => {
			fetchSubscriptionStatus();
		}, 1000);
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
					<p className="text-gray-600">Loading subscription info...</p>
				</div>
			</div>
		);
	}

	const hasActiveSubscription =
		subscription?.status === "active" || subscription?.status === "trialing";

	return (
		<div className="mx-auto max-w-4xl py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">PayPal Subscription</h1>
				<p className="mt-2 text-gray-600">
					Subscribe to our service using PayPal for secure monthly billing
				</p>
			</div>

			{/* Error message */}
			{error && (
				<div className="mb-6 rounded-md bg-red-50 p-4">
					<p className="text-sm text-red-800">{error}</p>
				</div>
			)}

			{/* Current subscription status */}
			{hasActiveSubscription && subscription ? (
				<div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
					<div className="flex items-start justify-between">
						<div>
							<h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
							<div className="mt-4 space-y-2">
								<p className="text-gray-600">
									<span className="font-medium">Status:</span>{" "}
									<span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
										{subscription.status}
									</span>
								</p>
								{subscription.plan && (
									<>
										<p className="text-gray-600">
											<span className="font-medium">Plan:</span> {subscription.plan.name}
										</p>
										<p className="text-gray-600">
											<span className="font-medium">Price:</span> $
											{(subscription.plan.price / 100).toFixed(2)}/
											{subscription.plan.billing_period}
										</p>
									</>
								)}
								{subscription.provider && (
									<p className="text-gray-600">
										<span className="font-medium">Provider:</span>{" "}
										<span className="capitalize">{subscription.provider}</span>
									</p>
								)}
								{subscription.currentPeriodEnd && (
									<p className="text-gray-600">
										<span className="font-medium">Next billing:</span>{" "}
										{new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
									</p>
								)}
							</div>
						</div>
					</div>

					{subscription.provider === "paypal" && (
						<div className="mt-6 rounded-md bg-blue-50 p-4">
							<p className="text-sm text-blue-800">
								You can manage your PayPal subscription directly from your PayPal account or
								contact support for assistance.
							</p>
						</div>
					)}
				</div>
			) : (
				<>
					{/* Subscription plans */}
					<div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
						<h2 className="mb-4 text-xl font-semibold text-gray-900">Choose Your Plan</h2>

						<div className="space-y-4">
							{/* Basic plan example - replace with actual plans from your database */}
							<div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
								<div className="flex items-start justify-between">
									<div>
										<h3 className="text-lg font-semibold text-gray-900">Monthly Plan</h3>
										<p className="mt-2 text-gray-600">
											Full access to all features with monthly billing
										</p>
										<p className="mt-4 text-3xl font-bold text-gray-900">
											$29.99
											<span className="text-base font-normal text-gray-600">/month</span>
										</p>
										<ul className="mt-4 space-y-2 text-sm text-gray-600">
											<li className="flex items-center gap-2">
												<svg
													className="h-5 w-5 text-green-500"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
												Unlimited access
											</li>
											<li className="flex items-center gap-2">
												<svg
													className="h-5 w-5 text-green-500"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
												Priority support
											</li>
											<li className="flex items-center gap-2">
												<svg
													className="h-5 w-5 text-green-500"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
												Cancel anytime
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* PayPal subscription button */}
					<div className="rounded-lg border border-gray-200 bg-white p-6">
						<h2 className="mb-4 text-xl font-semibold text-gray-900">
							Subscribe with PayPal
						</h2>
						<p className="mb-6 text-gray-600">
							Click the button below to set up a secure monthly subscription through PayPal.
							You can cancel anytime from your PayPal account.
						</p>

						<PayPalProvider>
							<PayPalSubscriptionButton
								planId={1} // TODO: Replace with actual plan ID from your database
								onSuccess={handleSubscriptionSuccess}
								onError={(error) => {
									console.error("Subscription error:", error);
									setError(error);
								}}
								className="max-w-md"
							/>
						</PayPalProvider>

						<div className="mt-6 rounded-md bg-gray-50 p-4">
							<h3 className="text-sm font-medium text-gray-900">Why PayPal?</h3>
							<ul className="mt-2 space-y-1 text-sm text-gray-600">
								<li>• Secure payment processing</li>
								<li>• No credit card required if you have a PayPal balance</li>
								<li>• Easy subscription management from your PayPal account</li>
								<li>• Buyer protection included</li>
							</ul>
						</div>
					</div>

					{/* Alternative payment method link */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Prefer to use a credit card?{" "}
							<a href="/billing" className="font-medium text-blue-600 hover:text-blue-500">
								Subscribe with Stripe instead
							</a>
						</p>
					</div>
				</>
			)}
		</div>
	);
}
