"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ExternalLink, Calendar, Sparkles } from "lucide-react";

interface PlanInfo {
	name: string;
	price: number;
	currency: string;
	billing_period: string;
}

interface SubscriptionInfo {
	status: string;
	planSlug: string;
	plan?: PlanInfo;
	currentPeriodEnd?: number;
	cancelAtPeriodEnd?: boolean;
}

interface AvailablePlan {
	id: number;
	name: string;
	description: string;
	price: number;
	currency: string;
	billing_period: string;
	features: string[];
	stripe_price_id: string;
	trial_days: number;
}

export function SubscriptionManager() {
	const [loading, setLoading] = useState(true);
	const [plansLoading, setPlansLoading] = useState(true);
	const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
	const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);
	const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
	const [portalLoading, setPortalLoading] = useState(false);

	useEffect(() => {
		fetchSubscription();
		fetchAvailablePlans();
	}, []);

	const fetchSubscription = async () => {
		try {
			const response = await fetch("/api/billing/subscription");
			if (response.ok) {
				const data = (await response.json()) as SubscriptionInfo;
				setSubscription(data);
			}
		} catch (error) {
			console.error("Failed to fetch subscription:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchAvailablePlans = async () => {
		try {
			const response = await fetch("/api/plans");
			if (response.ok) {
				const data = (await response.json()) as { success: boolean; plans: AvailablePlan[] };
				if (data.success && data.plans) {
					setAvailablePlans(data.plans);
				}
			}
		} catch (error) {
			console.error("Failed to fetch plans:", error);
		} finally {
			setPlansLoading(false);
		}
	};

	const handleSubscribe = async (planSlug: string) => {
		setCheckoutLoading(planSlug);
		try {
			console.log("Creating checkout session for plan:", planSlug);
			const response = await fetch("/api/billing/create-checkout-session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ planSlug }),
			});

			if (!response.ok) {
				const errorData = (await response.json()) as { error?: string };
				console.error("Checkout session error:", errorData);
				alert(`Failed to create checkout: ${errorData.error || "Unknown error"}`);
				return;
			}

			const data = (await response.json()) as { url?: string };
			if (data.url) {
				window.location.href = data.url;
			} else {
				console.error("No checkout URL received");
				alert("Failed to get checkout URL");
			}
		} catch (error) {
			console.error("Failed to create checkout session:", error);
			alert("An error occurred. Please try again.");
		} finally {
			setCheckoutLoading(null);
		}
	};

	const handleManageBilling = async () => {
		setPortalLoading(true);
		try {
			const response = await fetch("/api/billing/create-portal-session", {
				method: "POST",
			});
			const data = (await response.json()) as { url?: string };
			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Failed to create portal session:", error);
		} finally {
			setPortalLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		const statusColors: Record<string, string> = {
			active: "bg-green-500",
			trialing: "bg-blue-500",
			past_due: "bg-yellow-500",
			canceled: "bg-red-500",
			inactive: "bg-gray-500",
		};

		return (
			<Badge className={statusColors[status] || "bg-gray-500"}>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</Badge>
		);
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getPlanSlug = (planName: string): string => {
		// Remove "Plan" suffix if it exists and convert to lowercase
		// "Essentials Plan" -> "essentials"
		// "Premium" -> "premium"
		return planName.toLowerCase().replace(/\s*plan\s*$/i, "").trim();
	};

	const isCurrentPlan = (planName: string): boolean => {
		if (!subscription || subscription.status === "inactive") return false;
		const planSlug = getPlanSlug(planName);
		return subscription.planSlug === planSlug;
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-64" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-24 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Current Subscription Status */}
			{subscription && subscription.status !== "inactive" && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Current Plan</CardTitle>
								<CardDescription>Your active subscription</CardDescription>
							</div>
							{getStatusBadge(subscription.status)}
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between rounded-lg border p-4">
								<div>
									<h3 className="font-semibold text-lg">
										{subscription.plan?.name || subscription.planSlug.charAt(0).toUpperCase() + subscription.planSlug.slice(1)}
									</h3>
									{subscription.plan && (
										<p className="text-sm text-muted-foreground">
											{subscription.plan.currency.toUpperCase()} ${subscription.plan.price} / {subscription.plan.billing_period}
										</p>
									)}
								</div>
								<Button onClick={handleManageBilling} disabled={portalLoading} variant="outline" className="flex items-center gap-2">
									<ExternalLink className="h-4 w-4" />
									{portalLoading ? "Loading..." : "Manage Billing"}
								</Button>
							</div>

							{subscription.currentPeriodEnd && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar className="h-4 w-4" />
									<span>
										{subscription.cancelAtPeriodEnd
											? `Cancels on ${formatDate(subscription.currentPeriodEnd)}`
											: `Renews on ${formatDate(subscription.currentPeriodEnd)}`}
									</span>
								</div>
							)}

							{subscription.cancelAtPeriodEnd && (
								<div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
									Your subscription will be canceled at the end of the current billing period.
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Available Plans */}
			<div>
				<h2 className="text-2xl font-bold mb-4">Available Plans</h2>
				{plansLoading ? (
					<div className="grid gap-6 md:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<Card key={i}>
								<CardHeader>
									<Skeleton className="h-6 w-32" />
									<Skeleton className="h-4 w-full" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-32 w-full" />
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-3">
						{availablePlans.map((plan) => {
							const isCurrent = isCurrentPlan(plan.name);
							const planSlug = getPlanSlug(plan.name);

							return (
								<Card key={plan.id} className={isCurrent ? "border-primary shadow-lg" : ""}>
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle>{plan.name}</CardTitle>
											{isCurrent && (
												<Badge variant="default" className="flex items-center gap-1">
													<Sparkles className="h-3 w-3" />
													Current
												</Badge>
											)}
										</div>
										<CardDescription>{plan.description}</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<div className="flex items-baseline gap-1">
												<span className="text-4xl font-bold">${plan.price}</span>
												<span className="text-muted-foreground">/{plan.billing_period}</span>
											</div>
										</div>

										<ul className="space-y-2">
											{plan.features.map((feature, index) => (
												<li key={index} className="flex items-start gap-2 text-sm">
													<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
													<span>{feature}</span>
												</li>
											))}
										</ul>
									</CardContent>
									<CardFooter>
										{isCurrent ? (
											<Button variant="outline" className="w-full" disabled>
												Current Plan
											</Button>
										) : (
											<Button
												className="w-full"
												onClick={() => handleSubscribe(planSlug)}
												disabled={checkoutLoading === planSlug}
											>
												{checkoutLoading === planSlug ? "Loading..." : subscription?.status === "inactive" ? "Subscribe" : "Change Plan"}
											</Button>
										)}
									</CardFooter>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
