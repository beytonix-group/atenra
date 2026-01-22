"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Package,
	Loader2,
	AlertCircle,
	ArrowLeft,
	CreditCard,
	Calendar,
	Hash,
} from "lucide-react";

interface OrderItem {
	id: number;
	title: string;
	description: string | null;
	quantity: number;
	unitPriceCents: number;
	discountCents: number;
	totalCents: number;
}

interface Order {
	id: number;
	userId: number;
	orderNumber: string;
	status: string;
	subtotalCents: number;
	discountCents: number;
	discountType: string | null;
	discountReason: string | null;
	taxCents: number;
	totalCents: number;
	currency: string;
	paymentProvider: string | null;
	stripeCheckoutSessionId: string | null;
	stripePaymentIntentId: string | null;
	paypalOrderId: string | null;
	paypalCaptureId: string | null;
	createdAt: number;
	completedAt: number | null;
	items: OrderItem[];
}

interface OrderDetailContentProps {
	orderId: string;
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
	switch (status) {
		case "completed":
			return "default";
		case "pending":
		case "processing":
			return "secondary";
		case "failed":
		case "cancelled":
			return "destructive";
		case "refunded":
			return "outline";
		default:
			return "secondary";
	}
}

function formatDate(timestamp: number): string {
	return new Date(timestamp * 1000).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function OrderDetailContent({ orderId }: OrderDetailContentProps) {
	const [order, setOrder] = useState<Order | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchOrder = useCallback(async () => {
		try {
			const res = await fetch(`/api/orders/${orderId}`);
			if (res.ok) {
				const data = await res.json() as { order: Order };
				setOrder(data.order);
				setError(null);
			} else if (res.status === 404) {
				setError("Order not found");
			} else {
				setError("Failed to load order details");
			}
		} catch (err) {
			console.error("Failed to fetch order:", err);
			setError("Failed to load order. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [orderId]);

	useEffect(() => {
		fetchOrder();
	}, [fetchOrder]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !order) {
		return (
			<Card className="max-w-2xl mx-auto">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-xl font-semibold mb-2">{error || "Order not found"}</h2>
					<p className="text-muted-foreground mb-6 text-center">
						The order you&apos;re looking for could not be found.
					</p>
					<Link href="/orders">
						<Button>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Orders
						</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href="/orders">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Orders
					</Button>
				</Link>
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
						<Badge variant={getStatusBadgeVariant(order.status)}>
							{order.status}
						</Badge>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Order Items */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Order Items</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{order.items.map((item) => (
							<div key={item.id} className="flex items-start gap-3">
								<div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
									<Package className="h-5 w-5 text-muted-foreground" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium">{item.title}</p>
									{item.description && (
										<p className="text-sm text-muted-foreground truncate">
											{item.description}
										</p>
									)}
									<p className="text-sm text-muted-foreground">
										Qty: {item.quantity} x ${(item.unitPriceCents / 100).toFixed(2)}
									</p>
								</div>
								<div className="text-right">
									<p className="font-medium">
										${(item.totalCents / 100).toFixed(2)}
									</p>
								</div>
							</div>
						))}

						<Separator />

						{/* Totals */}
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Subtotal</span>
								<span>${(order.subtotalCents / 100).toFixed(2)}</span>
							</div>
							{order.discountCents > 0 && (
								<div className="flex justify-between text-sm text-green-600">
									<span>
										Discount
										{order.discountReason && (
											<span className="text-muted-foreground ml-1">
												({order.discountReason})
											</span>
										)}
									</span>
									<span>-${(order.discountCents / 100).toFixed(2)}</span>
								</div>
							)}
							{order.taxCents > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tax</span>
									<span>${(order.taxCents / 100).toFixed(2)}</span>
								</div>
							)}
							<Separator />
							<div className="flex justify-between font-semibold text-lg">
								<span>Total</span>
								<span>${(order.totalCents / 100).toFixed(2)}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Order Details */}
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Order Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3">
								<Hash className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Order Number</p>
									<p className="font-medium">{order.orderNumber}</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Order Date</p>
									<p className="font-medium">{formatDate(order.createdAt)}</p>
								</div>
							</div>

							{order.completedAt && (
								<div className="flex items-center gap-3">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Completed</p>
										<p className="font-medium">{formatDate(order.completedAt)}</p>
									</div>
								</div>
							)}

							{order.paymentProvider && (
								<div className="flex items-center gap-3">
									<CreditCard className="h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Payment Method</p>
										<p className="font-medium capitalize">{order.paymentProvider}</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Help Section */}
					<Card>
						<CardContent className="pt-6">
							<p className="text-sm text-muted-foreground">
								Need help with your order?{" "}
								<Link href="/support" className="text-primary hover:underline">
									Contact support
								</Link>
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
