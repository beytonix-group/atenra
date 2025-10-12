"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { UpdatePaymentModal } from "./UpdatePaymentModal";

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
	brand: string;
	last4: string;
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
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatePaymentOpen, setUpdatePaymentOpen] = useState(false);
	const [cancelLoading, setCancelLoading] = useState(false);

	useEffect(() => {
		fetchBillingData();
	}, []);

	const fetchBillingData = async () => {
		setLoading(true);
		try {
			// Fetch subscription
			const subResponse = await fetch('/api/billing/subscription');
			const subData = await subResponse.json();

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

			// Fetch payment method
			const pmResponse = await fetch('/api/billing/payment-method');
			const pmData = await pmResponse.json();
			if (pmData.paymentMethod) {
				setPaymentMethod(pmData.paymentMethod);
			}

			// Fetch invoices
			const invResponse = await fetch('/api/billing/invoices');
			const invData = await invResponse.json();
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
										You don't have an active subscription plan
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

			{/* Payment Method Section */}
			<Card className="border bg-card">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold mb-3">Payment</h3>
							{paymentMethod ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<CreditCard className="h-5 w-5" />
									<span>
										{paymentMethod.brand} •••• {paymentMethod.last4}
									</span>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No payment method on file</p>
							)}
						</div>

						<Button
							variant="outline"
							onClick={() => setUpdatePaymentOpen(true)}
						>
							Update
						</Button>
					</div>
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

			{/* Update Payment Modal */}
			<UpdatePaymentModal
				open={updatePaymentOpen}
				onOpenChange={setUpdatePaymentOpen}
				onSuccess={fetchBillingData}
			/>
		</div>
	);
}
