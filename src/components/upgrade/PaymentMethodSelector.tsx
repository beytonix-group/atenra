"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Loader2 } from "lucide-react";
import { PayPalProvider } from "@/components/paypal/paypal-provider";
import { PayPalSubscriptionButton } from "@/components/paypal/paypal-subscription-button";

interface PaymentMethodSelectorProps {
	open: boolean;
	onClose: () => void;
	planId: number;
	planName: string;
	planPrice: number;
	onStripeCheckout: () => void;
}

/**
 * Payment Method Selector Dialog
 *
 * Allows users to choose between Stripe (credit/debit card) and PayPal
 * for their subscription payment.
 */
export function PaymentMethodSelector({
	open,
	onClose,
	planId,
	planName,
	planPrice,
	onStripeCheckout,
}: PaymentMethodSelectorProps) {
	const [stripeLoading, setStripeLoading] = useState(false);

	const handleStripeClick = () => {
		setStripeLoading(true);
		onStripeCheckout();
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Choose Payment Method</DialogTitle>
					<DialogDescription>
						Subscribe to <span className="font-semibold">{planName}</span> for ${planPrice}/month
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					{/* Stripe Option */}
					<div className="rounded-lg border-2 border-border p-6 hover:border-primary/50 transition-colors bg-card">
						<div className="flex items-center gap-3 mb-4">
							<div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
								<CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<h3 className="font-semibold text-lg text-foreground">Credit or Debit Card</h3>
								<p className="text-sm text-muted-foreground">
									Secure payment with Stripe
								</p>
							</div>
						</div>
						<Button
							onClick={handleStripeClick}
							disabled={stripeLoading}
							className="w-full bg-blue-600 hover:bg-blue-700"
							size="lg"
						>
							{stripeLoading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Redirecting...
								</>
							) : (
								"Continue with Card"
							)}
						</Button>
						<p className="text-xs text-center text-muted-foreground mt-2">
							Visa, Mastercard, Amex, and more
						</p>
					</div>

					{/* Divider */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground font-medium">
								Or
							</span>
						</div>
					</div>

					{/* PayPal Option */}
					<div className="rounded-lg border-2 border-border p-6 hover:border-primary/50 transition-colors bg-card">
						<div className="flex items-center gap-3 mb-4">
							<div className="rounded-full bg-blue-50 dark:bg-blue-900/20 p-2">
								<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
									<path
										d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .758-.653h8.49c.87 0 1.638.084 2.287.25 1.858.479 2.914 1.677 2.914 3.475 0 .267-.024.54-.073.817a5.473 5.473 0 0 1-.512 1.598c-.656 1.29-1.798 2.316-3.197 2.862a9.58 9.58 0 0 1-1.565.377 13.935 13.935 0 0 1-2.164.162H9.77a.77.77 0 0 0-.758.653l-.803 5.093-.012.076a.384.384 0 0 1-.38.327z"
										fill="#003087"
									/>
									<path
										d="M23 7.667c0 3.684-1.77 5.883-5.193 5.883h-1.326a.7.7 0 0 0-.691.593l-.806 5.108a.5.5 0 0 1-.493.423h-2.754a.384.384 0 0 1-.38-.445l.897-5.686a.77.77 0 0 1 .758-.653h1.565c4.42 0 7.123-2.199 7.123-5.883 0-.267-.024-.54-.073-.817a5.473 5.473 0 0 0-.512-1.598c-.656-1.29-1.798-2.316-3.197-2.862.65.186 1.23.45 1.732.795 1.476.995 2.35 2.608 2.35 4.742z"
										fill="#0070E0"
									/>
								</svg>
							</div>
							<div>
								<h3 className="font-semibold text-lg text-foreground">PayPal</h3>
								<p className="text-sm text-muted-foreground">
									Pay with your PayPal account
								</p>
							</div>
						</div>

						{/* PayPal buttons container - light background for PayPal's white buttons */}
						<div className="rounded-lg bg-white dark:bg-gray-50 p-3">
							<PayPalProvider>
								<PayPalSubscriptionButton
									planId={planId}
									onSuccess={(subscriptionId) => {
										console.log("PayPal subscription created:", subscriptionId);
										onClose();
										// Success page will be handled by PayPalSubscriptionButton
									}}
									onError={(error) => {
										console.error("PayPal error:", error);
										// Error handling is done in PayPalSubscriptionButton
									}}
								/>
							</PayPalProvider>
						</div>

						<p className="text-xs text-center text-muted-foreground mt-3">
							PayPal balance, credit/debit card via PayPal
						</p>
					</div>
				</div>

				<div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
					<div className="flex items-center gap-2">
						<svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
						<span className="text-xs text-muted-foreground">Secure & encrypted</span>
					</div>
					<div className="flex items-center gap-2">
						<svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<span className="text-xs text-muted-foreground">PCI compliant</span>
					</div>
					<div className="flex items-center gap-2">
						<svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
						<span className="text-xs text-muted-foreground">Cancel anytime</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
