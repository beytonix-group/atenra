"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";

interface Subscription {
	id: number;
	planName: string;
	planType: string;
	price: number;
	status: string;
	currentPeriodEnd: string;
	stripeSubscriptionId?: string;
	cancelAtPeriodEnd?: boolean;
	canceledAt?: number | null;
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
	const [notification, setNotification] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);
	const [showCancelDialog, setShowCancelDialog] = useState(false);
	const [showRemoveDialog, setShowRemoveDialog] = useState(false);
	const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);

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
				cancelAtPeriodEnd?: boolean;
				canceledAt?: number | null;
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
					stripeSubscriptionId: undefined,
					cancelAtPeriodEnd: subData.cancelAtPeriodEnd || false,
					canceledAt: subData.canceledAt
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
		setCancelLoading(true);
		setShowCancelDialog(false);
		try {
			const response = await fetch('/api/billing/cancel', {
				method: 'POST',
			});

			const data = await response.json() as { success?: boolean; message?: string; error?: string };

			if (response.ok && data.success) {
				setNotification({
					type: 'success',
					message: data.message || 'Subscription cancelled successfully. You will retain access until the end of your billing period.'
				});
				setTimeout(() => setNotification(null), 5000);
				await fetchBillingData();
			} else {
				setNotification({
					type: 'error',
					message: data.error || 'Failed to cancel subscription'
				});
				setTimeout(() => setNotification(null), 5000);
			}
		} catch (error) {
			console.error("Error cancelling subscription:", error);
			setNotification({
				type: 'error',
				message: 'An unexpected error occurred while cancelling subscription'
			});
			setTimeout(() => setNotification(null), 5000);
		} finally {
			setCancelLoading(false);
		}
	};

	const confirmRemovePaymentMethod = (paymentMethodId: number) => {
		setSelectedPaymentMethodId(paymentMethodId);
		setShowRemoveDialog(true);
	};

	const handleRemovePaymentMethod = async () => {
		if (!selectedPaymentMethodId) return;

		setRemovingId(selectedPaymentMethodId);
		setShowRemoveDialog(false);
		try {
			const response = await fetch('/api/billing/payment-method', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ paymentMethodId: selectedPaymentMethodId }),
			});

			if (response.ok) {
				await fetchBillingData();
				setNotification({
					type: 'success',
					message: 'Payment method removed successfully'
				});
				setTimeout(() => setNotification(null), 5000);
			} else {
				const data = await response.json() as { error?: string };
				setNotification({
					type: 'error',
					message: data.error || 'Failed to remove payment method'
				});
				setTimeout(() => setNotification(null), 5000);
			}
		} catch (error) {
			console.error("Error removing payment method:", error);
			setNotification({
				type: 'error',
				message: 'Failed to remove payment method'
			});
			setTimeout(() => setNotification(null), 5000);
		} finally {
			setRemovingId(null);
			setSelectedPaymentMethodId(null);
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
				setNotification({
					type: 'success',
					message: 'Default payment method updated successfully'
				});
				setTimeout(() => setNotification(null), 5000);
			} else {
				const data = await response.json() as { error?: string };
				setNotification({
					type: 'error',
					message: data.error || 'Failed to set default payment method'
				});
				setTimeout(() => setNotification(null), 5000);
			}
		} catch (error) {
			console.error("Error setting default payment method:", error);
			setNotification({
				type: 'error',
				message: 'Failed to set default payment method'
			});
			setTimeout(() => setNotification(null), 5000);
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
				setNotification({
					type: 'error',
					message: data.error || 'Failed to create checkout session'
				});
				setTimeout(() => setNotification(null), 5000);
				setAddingPaymentMethod(false);
			}
		} catch (error) {
			console.error("Error creating checkout session:", error);
			setNotification({
				type: 'error',
				message: 'Failed to create checkout session'
			});
			setTimeout(() => setNotification(null), 5000);
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
			{/* Notification */}
			{notification && (
				<Alert
					variant={notification.type === 'error' ? 'destructive' : 'default'}
					className="relative pr-12"
				>
					{notification.type === 'success' ? (
						<CheckCircle2 className="h-4 w-4" />
					) : (
						<AlertCircle className="h-4 w-4" />
					)}
					<AlertDescription>{notification.message}</AlertDescription>
					<button
						onClick={() => setNotification(null)}
						className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
					>
						<X className="h-4 w-4" />
					</button>
				</Alert>
			)}

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
								{subscription && subscription.cancelAtPeriodEnd && (
									<p className="text-sm text-destructive mt-1 font-medium">
										⚠️ Subscription cancelled. Access ends on {formatDate(subscription.currentPeriodEnd)}.
									</p>
								)}
								{subscription && !subscription.cancelAtPeriodEnd && (
									<p className="text-sm text-muted-foreground mt-1">
										Your subscription will auto renew on {formatDate(subscription.currentPeriodEnd)}.
									</p>
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

			{/* Cancellation Status - Show if subscription is cancelled */}
			{subscription && subscription.cancelAtPeriodEnd && subscription.canceledAt && (
				<Card className="border border-destructive/50 bg-card">
					<CardContent className="p-6">
						<div className="flex items-start gap-4">
							<AlertCircle className="h-6 w-6 text-destructive mt-0.5" />
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-destructive">Subscription Cancelled</h3>
								<div className="mt-2 space-y-1 text-sm text-muted-foreground">
									<p>
										<span className="font-medium">Cancelled on:</span>{" "}
										{new Date(subscription.canceledAt * 1000).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit"
										})}
									</p>
									<p>
										<span className="font-medium">Access ends:</span>{" "}
										{formatDate(subscription.currentPeriodEnd)}
									</p>
									<p className="mt-3 text-foreground">
										You will retain access to {subscription.planName} features until {formatDate(subscription.currentPeriodEnd)}. After this date, your subscription will not renew and you&apos;ll be downgraded to the free plan.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

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
											onClick={() => confirmRemovePaymentMethod(pm.id)}
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

			{/* Cancellation Section - Only show if user has active subscription that is not yet cancelled */}
			{subscription && !subscription.cancelAtPeriodEnd && (
				<Card className="border bg-card">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold">Cancellation</h3>
								<p className="text-sm text-muted-foreground mt-1">Cancel your subscription</p>
							</div>

							<Button
								variant="destructive"
								onClick={() => setShowCancelDialog(true)}
								disabled={cancelLoading}
							>
								{cancelLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Cancelling...
									</>
								) : (
									"Cancel Subscription"
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Cancel Subscription Confirmation Dialog */}
			<Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cancel Subscription</DialogTitle>
						<DialogDescription>
							Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowCancelDialog(false)}
						>
							Keep Subscription
						</Button>
						<Button
							variant="destructive"
							onClick={handleCancelSubscription}
						>
							Cancel Subscription
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Remove Payment Method Confirmation Dialog */}
			<Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Remove Payment Method</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove this payment method? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowRemoveDialog(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleRemovePaymentMethod}
						>
							Remove
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

		</div>
	);
}
