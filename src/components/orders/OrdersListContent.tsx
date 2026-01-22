"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Package,
	Loader2,
	AlertCircle,
	ChevronRight,
	ShoppingBag,
} from "lucide-react";

interface Order {
	id: number;
	orderNumber: string;
	status: string;
	totalCents: number;
	currency: string;
	paymentProvider: string | null;
	createdAt: number;
	completedAt: number | null;
	itemCount: number;
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
		month: "short",
		day: "numeric",
	});
}

export function OrdersListContent() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchOrders = useCallback(async () => {
		try {
			const res = await fetch("/api/orders");
			if (res.ok) {
				const data = await res.json() as { orders: Order[] };
				setOrders(data.orders);
				setError(null);
			} else {
				setError("Failed to load orders");
			}
		} catch (err) {
			console.error("Failed to fetch orders:", err);
			setError("Failed to load orders. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<Card className="max-w-2xl mx-auto">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<AlertCircle className="h-16 w-16 text-destructive mb-4" />
					<h2 className="text-xl font-semibold mb-2">Unable to load orders</h2>
					<p className="text-muted-foreground mb-6 text-center">{error}</p>
					<Button onClick={() => { setIsLoading(true); fetchOrders(); }}>
						Try Again
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (orders.length === 0) {
		return (
			<Card className="max-w-2xl mx-auto">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
					<h2 className="text-xl font-semibold mb-2">No orders yet</h2>
					<p className="text-muted-foreground mb-6 text-center">
						You haven&apos;t placed any orders yet. Browse our marketplace to find services.
					</p>
					<Link href="/marketplace">
						<Button>Browse Marketplace</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Order History</h1>
			</div>

			<div className="space-y-4">
				{orders.map((order) => (
					<Link key={order.id} href={`/orders/${order.id}`}>
						<Card className="hover:bg-muted/50 transition-colors cursor-pointer">
							<CardContent className="py-4">
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
										<Package className="h-6 w-6 text-muted-foreground" />
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="font-semibold">{order.orderNumber}</p>
											<Badge variant={getStatusBadgeVariant(order.status)}>
												{order.status}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground">
											{formatDate(order.createdAt)} · {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
										</p>
									</div>

									<div className="text-right flex items-center gap-2">
										<div>
											<p className="font-semibold">
												${(order.totalCents / 100).toFixed(2)}
											</p>
											{order.paymentProvider && (
												<p className="text-xs text-muted-foreground capitalize">
													{order.paymentProvider}
												</p>
											)}
										</div>
										<ChevronRight className="h-5 w-5 text-muted-foreground" />
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
