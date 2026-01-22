"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	ShoppingCart,
	Loader2,
	Package,
	AlertCircle,
	CreditCard,
	ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DiscountSection } from "./DiscountSection";

interface CartItem {
	id: number;
	title: string;
	description: string | null;
	quantity: number;
	unitPriceCents: number | null;
}

interface DiscountInfo {
	discountCents: number;
	discountType: string | null;
	discountReason: string | null;
}

export function CheckoutContent() {
	const [items, setItems] = useState<CartItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState<"stripe" | "paypal">("stripe");
	const [appliedDiscount, _setAppliedDiscount] = useState<DiscountInfo | null>(null);

	const fetchCartItems = useCallback(async () => {
		try {
			const res = await fetch("/api/cart");
			if (res.ok) {
				const data = await res.json() as { items: CartItem[] };
				setItems(data.items);
				setFetchError(null);
			} else {
				setFetchError("Failed to load cart. Please try again.");
			}
		} catch (error) {
			console.error("Failed to fetch cart:", error);
			setFetchError("Failed to load cart. Please check your connection and try again.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCartItems();
	}, [fetchCartItems]);

	async function handleApplyCoupon(_code: string): Promise<{ valid: boolean; error?: string }> {
		// Placeholder: coupons not implemented yet
		return { valid: false, error: "Coupon codes are not yet available" };
	}

	async function handleStripeCheckout() {
		setIsCheckingOut(true);

		try {
			const res = await fetch("/api/checkout/cart", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					couponCode: null, // Will be implemented later
				}),
			});

			const data = await res.json() as { url?: string; error?: string };

			if (!res.ok) {
				throw new Error(data.error || "Failed to create checkout session");
			}

			// Redirect to Stripe checkout
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error: any) {
			console.error("Checkout error:", error);
			toast.error(error.message || "Failed to start checkout. Please try again.");
			setIsCheckingOut(false);
		}
	}

	async function handlePayPalCheckout() {
		setIsCheckingOut(true);

		try {
			const res = await fetch("/api/checkout/paypal/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					couponCode: null,
				}),
			});

			const data = await res.json() as { approvalUrl?: string; error?: string };

			if (!res.ok) {
				throw new Error(data.error || "Failed to create PayPal order");
			}

			// Redirect to PayPal
			if (data.approvalUrl) {
				window.location.href = data.approvalUrl;
			}
		} catch (error: any) {
			console.error("PayPal checkout error:", error);
			toast.error(error.message || "Failed to start PayPal checkout. Please try again.");
			setIsCheckingOut(false);
		}
	}

	function handleCheckout() {
		if (selectedPayment === "stripe") {
			handleStripeCheckout();
		} else {
			handlePayPalCheckout();
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (fetchError) {
		return (
			<Card className="max-w-2xl mx-auto">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-xl font-semibold mb-2">Unable to load cart</h2>
					<p className="text-muted-foreground mb-6 text-center">{fetchError}</p>
					<Button onClick={() => { setIsLoading(true); fetchCartItems(); }}>
						Try Again
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (items.length === 0) {
		return (
			<Card className="max-w-2xl mx-auto">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
					<h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
					<p className="text-muted-foreground mb-6 text-center">
						Add items to your cart before checking out.
					</p>
					<Link href="/marketplace">
						<Button>Browse Marketplace</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	// Check if all items have prices
	const itemsWithoutPrices = items.filter(item => item.unitPriceCents === null);
	const hasAllPrices = itemsWithoutPrices.length === 0;

	const subtotal = items.reduce((sum, item) => {
		return sum + ((item.unitPriceCents ?? 0) * item.quantity);
	}, 0);

	const discountCents = appliedDiscount?.discountCents ?? 0;
	const total = Math.max(0, subtotal - discountCents);

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href="/cart">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Cart
					</Button>
				</Link>
				<h1 className="text-2xl font-bold">Checkout</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Order Summary */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Order Summary</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Items List */}
						<div className="space-y-3">
							{items.map((item) => (
								<div key={item.id} className="flex items-start gap-3">
									<div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
										<Package className="h-5 w-5 text-muted-foreground" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">{item.title}</p>
										{item.description && (
											<p className="text-sm text-muted-foreground truncate">
												{item.description}
											</p>
										)}
										<p className="text-sm text-muted-foreground">
											Qty: {item.quantity}
											{item.unitPriceCents !== null && (
												<> x ${(item.unitPriceCents / 100).toFixed(2)}</>
											)}
										</p>
									</div>
									<div className="text-right">
										{item.unitPriceCents !== null ? (
											<p className="font-medium">
												${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
											</p>
										) : (
											<p className="text-sm text-muted-foreground">Price pending</p>
										)}
									</div>
								</div>
							))}
						</div>

						{!hasAllPrices && (
							<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-950 dark:border-yellow-800">
								<p className="text-sm text-yellow-700 dark:text-yellow-300">
									Some items do not have prices set yet. Please wait for prices to be set before checking out.
								</p>
							</div>
						)}

						<Separator />

						{/* Discount Section */}
						<DiscountSection
							onApplyCoupon={handleApplyCoupon}
							appliedDiscount={appliedDiscount}
						/>
					</CardContent>
				</Card>

				{/* Payment Section */}
				<div className="space-y-4">
					{/* Order Total Card */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Order Total</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span>${(subtotal / 100).toFixed(2)}</span>
							</div>
							{discountCents > 0 && (
								<div className="flex justify-between text-sm text-green-600">
									<span>Discount</span>
									<span>-${(discountCents / 100).toFixed(2)}</span>
								</div>
							)}
							<Separator />
							<div className="flex justify-between font-semibold text-lg">
								<span>Total</span>
								<span>${(total / 100).toFixed(2)}</span>
							</div>
						</CardContent>
					</Card>

					{/* Payment Method Selection */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Payment Method</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{/* Stripe Option */}
							<button
								className={cn(
									"w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors",
									selectedPayment === "stripe"
										? "border-primary bg-primary/5"
										: "border-muted hover:border-muted-foreground/30"
								)}
								onClick={() => setSelectedPayment("stripe")}
								disabled={isCheckingOut}
							>
								<CreditCard className="h-5 w-5" />
								<div className="text-left flex-1">
									<p className="font-medium">Credit/Debit Card</p>
									<p className="text-xs text-muted-foreground">
										Powered by Stripe
									</p>
								</div>
								<div
									className={cn(
										"h-4 w-4 rounded-full border-2",
										selectedPayment === "stripe"
											? "border-primary bg-primary"
											: "border-muted-foreground/30"
									)}
								/>
							</button>

							{/* PayPal Option */}
							<button
								className={cn(
									"w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors",
									selectedPayment === "paypal"
										? "border-primary bg-primary/5"
										: "border-muted hover:border-muted-foreground/30"
								)}
								onClick={() => setSelectedPayment("paypal")}
								disabled={isCheckingOut}
							>
								<svg
									className="h-5 w-5"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.639h6.515c2.177 0 3.766.57 4.72 1.694.436.513.726 1.09.874 1.755.151.681.167 1.452.048 2.352l-.016.111v.309l.241.137c.203.104.37.218.51.347.333.308.563.684.69 1.128.131.458.174.986.129 1.576-.052.686-.2 1.305-.449 1.845a4.38 4.38 0 0 1-.912 1.373c-.368.365-.787.653-1.244.862-.443.203-.964.354-1.548.451-.567.094-1.19.141-1.855.141H11.99a.949.949 0 0 0-.938.803l-.019.117-.451 2.867-.015.092a.949.949 0 0 1-.937.803z" />
								</svg>
								<div className="text-left flex-1">
									<p className="font-medium">PayPal</p>
									<p className="text-xs text-muted-foreground">
										Pay with PayPal account
									</p>
								</div>
								<div
									className={cn(
										"h-4 w-4 rounded-full border-2",
										selectedPayment === "paypal"
											? "border-primary bg-primary"
											: "border-muted-foreground/30"
									)}
								/>
							</button>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								size="lg"
								onClick={handleCheckout}
								disabled={!hasAllPrices || isCheckingOut || total === 0}
							>
								{isCheckingOut ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Processing...
									</>
								) : (
									<>
										Pay ${(total / 100).toFixed(2)}
									</>
								)}
							</Button>
						</CardFooter>
					</Card>

					{/* Security Note */}
					<p className="text-xs text-center text-muted-foreground">
						Your payment is processed securely. We do not store your payment details.
					</p>
				</div>
			</div>
		</div>
	);
}
