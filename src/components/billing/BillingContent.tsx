"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";

interface Subscription {
	id: number;
	planName: string;
	planType: string;
	price: number;
	status: string;
	currentPeriodEnd: string;
	stripeSubscriptionId?: string;
}

interface PaymentMethod {
	id: number;
	stripePaymentMethodId: string;
	brand: string;
	last4: string;
	expMonth: number;
	expYear: number;
	isDefault: boolean;
	createdAt: number;
}

interface Invoice {
	id: string;
	date: string;
	amount: number;
	status: string;
	invoiceUrl: string;
}

export function BillingContent() {
	const router = useRouter();
	const [subscription, setSubscription] = useState<Subscription | null>(null);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);
	const [cancelLoading, setCancelLoading] = useState(false);
	const [removingId, setRemovingId] = useState<number | null>(null);

	useEffect(() => {
		fetchBillingData();

		// Check for setup completion from Stripe Checkout redirect
		const params = new URLSearchParams(window.location.search);
		const setupStatus = params.get('setup');

		if (setupStatus === 'success') {
			// Remove the query parameter
			window.history.replaceState({}, '', window.location.pathname);
			// The fetchBillingData call above will refresh the payment methods
		} else if (setupStatus === 'cancelled') {
			// Remove the query parameter
			window.history.replaceState({}, '', window.location.pathname);
		}
	}, []);

	const fetchBillingData = async () => {
		setLoading(true);
		try {
			// Fetch subscription
			const subResponse = await fetch('/api/billing/subscription');
			const subData = await subResponse.json() as {
				status: string;
				plan?: {
					name: string;
					price: number;
				};
				currentPeriodEnd?: number;
			};

			if (subData.status !== "inactive" && subData.plan) {
				setSubscription({
					id: 0, // Not returned by API
					planName: subData.plan.name,
					planType: "regular",
					price: subData.plan.price,
					status: subData.status,
					currentPeriodEnd: subData.currentPeriodEnd
						? new Date(subData.currentPeriodEnd * 1000).toISOString().split('T')[0]
						: new Date().toISOString().split('T')[0],
					stripeSubscriptionId: undefined
				});
			}

			// Fetch payment methods
			const pmResponse = await fetch('/api/billing/payment-method');
			const pmData = await pmResponse.json() as {
				paymentMethods?: PaymentMethod[];
			};
			if (pmData.paymentMethods) {
				setPaymentMethods(pmData.paymentMethods);
			}

			// Fetch invoices
			const invResponse = await fetch('/api/billing/invoices');
			const invData = await invResponse.json() as {
				invoices?: Invoice[];
			};
			if (invData.invoices) {
				setInvoices(invData.invoices);
			}

		} catch (error) {
			console.error("Error fetching billing data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancelSubscription = async () => {
		if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.")) {
			return;
		}

		setCancelLoading(true);
		try {
			// TODO: Implement cancel subscription API call
			// const response = await fetch('/api/billing/cancel', {
			//   method: 'POST',
			// });
			// if (response.ok) {
			//   await fetchBillingData();
			// }

			alert("Subscription cancellation will be implemented");
		} catch (error) {
			console.error("Error cancelling subscription:", error);
		} finally {
			setCancelLoading(false);
		}
	};

	const handleRemovePaymentMethod = async (paymentMethodId: number) => {
		if (!confirm("Are you sure you want to remove this payment method?")) {
			return;
		}

		setRemovingId(paymentMethodId);
		try {
			const response = await fetch('/api/billing/payment-method', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ paymentMethodId }),
			});

			if (response.ok) {
				await fetchBillingData();
			} else {
				const data = await response.json() as { error?: string };
				alert(data.error || "Failed to remove payment method");
			}
		} catch (error) {
			console.error("Error removing payment method:", error);
			alert("Failed to remove payment method");
		} finally {
			setRemovingId(null);
		}
	};

	const handleSetDefaultPaymentMethod = async (paymentMethodId: number) => {
		try {
			const response = await fetch('/api/billing/payment-method/set-default', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ paymentMethodId }),
			});

			if (response.ok) {
				await fetchBillingData();
			} else {
				const data = await response.json() as { error?: string };
				alert(data.error || "Failed to set default payment method");
			}
		} catch (error) {
			console.error("Error setting default payment method:", error);
			alert("Failed to set default payment method");
		}
	};

	const handleAddPaymentMethod = async () => {
		setAddingPaymentMethod(true);
		try {
			const response = await fetch('/api/billing/create-setup-session', {
				method: 'POST',
			});

			const data = await response.json() as { url?: string; error?: string };

			if (response.ok && data.url) {
				// Redirect to Stripe Checkout
				window.location.href = data.url;
			} else {
				alert(data.error || "Failed to create checkout session");
				setAddingPaymentMethod(false);
			}
		} catch (error) {
			console.error("Error creating checkout session:", error);
			alert("Failed to create checkout session");
			setAddingPaymentMethod(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="max-w-4xl space-y-6">
			{/* Current Plan Section */}
			<Card className="border bg-card">
				<CardContent className="p-6">
					<div className="flex items-start justify-between">
						<div className="flex gap-4">
							{/* Plan Icon */}
							<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-8 w-8 text-primary"
								>
									<circle cx="12" cy="8" r="3" />
									<path d="M12 11v9" />
									<path d="M8 15l4 4 4-4" />
									<path d="M8 9l4-4 4 4" />
								</svg>
							</div>

							<div>
								<h2 className="text-xl font-semibold">
									{subscription ? subscription.planName : "No plan"}
								</h2>
								{subscription && (
									<>
										<p className="text-sm text-muted-foreground mt-1">
											5x more usage than Pro
										</p>
										<p className="text-sm text-muted-foreground mt-1">
											Your subscription will auto renew on {formatDate(subscription.currentPeriodEnd)}.
										</p>
									</>
								)}
								{!subscription && (
									<p className="text-sm text-muted-foreground mt-1">
										You don&apos;t have an active subscription plan
									</p>
								)}
							</div>
						</div>

						<Button
							variant="outline"
							onClick={() => router.push('/upgrade')}
						>
							{subscription ? "Adjust plan" : "Add plan"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Payment Methods Section */}
			<Card className="border bg-card">
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold">Payment Methods</h3>
						<Button
							variant="outline"
							onClick={handleAddPaymentMethod}
							disabled={addingPaymentMethod}
						>
							{addingPaymentMethod ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Redirecting...
								</>
							) : (
								"Add Card"
							)}
						</Button>
					</div>

					{paymentMethods.length === 0 ? (
						<p className="text-sm text-muted-foreground">No payment methods on file</p>
					) : (
						<div className="space-y-3">
							{paymentMethods.map((pm) => (
								<div
									key={pm.id}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div className="flex items-center gap-3">
										<CreditCard className="h-5 w-5 text-muted-foreground" />
										<div>
											<div className="flex items-center gap-2">
												<span className="font-medium">
													{pm.brand} •••• {pm.last4}
												</span>
												{pm.isDefault && (
													<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
														Default
													</span>
												)}
											</div>
											<p className="text-sm text-muted-foreground">
												Expires {String(pm.expMonth).padStart(2, '0')}/{pm.expYear}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										{!pm.isDefault && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleSetDefaultPaymentMethod(pm.id)}
											>
												Set as Default
											</Button>
										)}
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleRemovePaymentMethod(pm.id)}
											disabled={removingId === pm.id}
										>
											{removingId === pm.id ? (
												<>
													<Loader2 className="mr-2 h-3 w-3 animate-spin" />
													Removing...
												</>
											) : (
												"Remove"
											)}
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Invoices Section */}
			<Card className="border bg-card">
				<CardContent className="p-6">
					<h3 className="text-lg font-semibold mb-4">Invoices</h3>

					{invoices.length === 0 ? (
						<p className="text-sm text-muted-foreground">No invoices available</p>
					) : (
						<div className="space-y-1">
							{/* Header */}
							<div className="grid grid-cols-4 gap-4 pb-2 text-sm font-medium text-muted-foreground">
								<div>Date</div>
								<div>Total</div>
								<div>Status</div>
								<div>Actions</div>
							</div>

							{/* Invoice Rows */}
							{invoices.map((invoice) => (
								<div
									key={invoice.id}
									className="grid grid-cols-4 gap-4 py-3 text-sm border-t"
								>
									<div>{formatDate(invoice.date)}</div>
									<div className="flex items-center gap-1">
										${invoice.amount.toFixed(2)}
										<span className="text-muted-foreground">ⓘ</span>
									</div>
									<div className="capitalize">{invoice.status}</div>
									<div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => window.open(invoice.invoiceUrl, "_blank")}
										>
											View
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Cancellation Section - Only show if user has active subscription */}
			{subscription && (
				<Card className="border bg-card">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold">Cancellation</h3>
								<p className="text-sm text-muted-foreground mt-1">Cancel plan</p>
							</div>

							<Button
								variant="destructive"
								onClick={handleCancelSubscription}
								disabled={cancelLoading}
							>
								{cancelLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Cancelling...
									</>
								) : (
									"Cancel"
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

		</div>
	);
}
