"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ArrowLeft, GraduationCap, Users, Briefcase, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
	id: number;
	name: string;
	tagline: string | null;
	price: number;
	currency: string;
	billing_period: string;
	plan_type: 'student' | 'regular' | 'business' | 'invite-only';
	quick_view_json: string | null;
	stripe_product_id: string | null;
	stripe_price_id: string | null;
	has_promotion: number;
	promotion_percent_off: number | null;
	promotion_months: number | null;
	is_invite_only: number;
	detailed_description: string | null;
}

interface CurrentSubscription {
	planId: number;
	status: string;
}

type PlanType = 'student' | 'regular' | 'business';

export function UpgradeContent() {
	const router = useRouter();
	const [selectedType, setSelectedType] = useState<PlanType>('regular');
	const [plans, setPlans] = useState<Plan[]>([]);
	const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
	const [loading, setLoading] = useState(true);
	const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);
	const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setLoading(true);
		try {
			// Fetch available plans
			const plansResponse = await fetch('/api/plans');
			const plansData = await plansResponse.json();

			setPlans(plansData.plans || []);

			// Fetch current subscription
			const subResponse = await fetch('/api/billing/subscription');
			const subData = await subResponse.json();

			if (subData.status !== "inactive") {
				// Get plan ID from plan name
				const currentPlan = plansData.plans?.find(
					(p: Plan) => p.name === subData.plan?.name
				);
				if (currentPlan) {
					setCurrentSubscription({
						planId: currentPlan.id,
						status: subData.status
					});
				}
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectPlan = async (planId: number) => {
		setProcessingPlanId(planId);
		try {
			// TODO: Implement Stripe checkout flow
			// This should create a Stripe Checkout Session and redirect
			const response = await fetch('/api/checkout/create-session', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ planId }),
			});

			const data = await response.json();

			if (data.url) {
				window.location.href = data.url;
			}
		} catch (error) {
			console.error("Error creating checkout session:", error);
		} finally {
			setProcessingPlanId(null);
		}
	};

	const parseQuickView = (quickViewJson: string | null): string[] => {
		if (!quickViewJson) return [];
		try {
			return JSON.parse(quickViewJson);
		} catch {
			return [];
		}
	};

	const getIcon = (planType: PlanType) => {
		switch (planType) {
			case 'student': return GraduationCap;
			case 'business': return Briefcase;
			default: return Users;
		}
	};

	const getPlanIcon = (plan: Plan) => {
		if (plan.is_invite_only) return Sparkles;
		if (plan.price >= 200) return Crown;
		return getIcon(plan.plan_type);
	};

	// Filter plans by selected type
	const filteredPlans = plans
		.filter(plan => plan.plan_type === selectedType)
		.sort((a, b) => a.price - b.price);

	// Filter invite-only plans
	const inviteOnlyPlans = plans
		.filter(plan => plan.plan_type === 'invite-only')
		.sort((a, b) => a.price - b.price);

	const getFirstSentence = (text: string | null) => {
		if (!text) return '';
		const match = text.match(/^[^.!?]+[.!?]/);
		return match ? match[0] : text;
	};

	const toggleDescription = (planId: number) => {
		setExpandedDescriptions(prev => ({
			...prev,
			[planId]: !prev[planId]
		}));
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto space-y-8">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h1 className="text-3xl font-bold">Choose Your Plan</h1>
					<p className="text-muted-foreground mt-1">
						Select the plan that best fits your needs
					</p>
				</div>
			</div>

			{/* Plan Type Toggle */}
			<div className="flex justify-center">
				<div className="inline-flex items-center gap-2 p-2 bg-muted/50 rounded-xl">
					<button
						onClick={() => setSelectedType('student')}
						className={cn(
							"flex items-center gap-3 px-8 py-3 rounded-lg text-base font-medium transition-all",
							selectedType === 'student'
								? "bg-background shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<GraduationCap className="h-5 w-5" />
						Student
					</button>
					<button
						onClick={() => setSelectedType('regular')}
						className={cn(
							"flex items-center gap-3 px-8 py-3 rounded-lg text-base font-medium transition-all",
							selectedType === 'regular'
								? "bg-background shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<Users className="h-5 w-5" />
						Personal
					</button>
					<button
						onClick={() => setSelectedType('business')}
						className={cn(
							"flex items-center gap-3 px-8 py-3 rounded-lg text-base font-medium transition-all",
							selectedType === 'business'
								? "bg-background shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						<Briefcase className="h-5 w-5" />
						Business
					</button>
				</div>
			</div>

			{/* Plans Grid */}
			<div className={cn(
				"grid gap-8",
				filteredPlans.length === 1 ? "max-w-md mx-auto" :
					filteredPlans.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" :
						filteredPlans.length === 3 ? "md:grid-cols-3 max-w-5xl mx-auto" :
							"md:grid-cols-2 lg:grid-cols-4"
			)}>
				{filteredPlans.map((plan) => {
					const isCurrentPlan = currentSubscription?.planId === plan.id;
					const Icon = getPlanIcon(plan);
					const quickView = parseQuickView(plan.quick_view_json);
					const hasPromotion = plan.has_promotion === 1;
					const originalPrice = hasPromotion && plan.promotion_percent_off
						? plan.price / (1 - plan.promotion_percent_off / 100)
						: plan.price;

					return (
						<div
							key={plan.id}
							className={cn(
								"relative flex flex-col rounded-xl border bg-card p-8 shadow-sm transition-all duration-300",
								"hover:shadow-xl hover:scale-[1.02]",
								isCurrentPlan && "border-primary",
								plan.price >= 100 && "border-primary/20"
							)}
						>
							{isCurrentPlan && (
								<div className="absolute top-4 right-4 z-10">
									<span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
										<Check className="h-3 w-3" />
										Current Plan
									</span>
								</div>
							)}

							{/* Icon & Name */}
							<div className="mb-6">
								<Icon className="h-8 w-8 text-primary mb-4" />
								<h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
								{plan.tagline && (
									<p className="text-sm text-muted-foreground">
										{plan.tagline}
									</p>
								)}
							</div>

							{/* Price */}
							<div className="mb-6">
								<div className="flex items-baseline gap-2">
									<span className="text-4xl font-bold">
										${plan.price === 0 ? 'Custom' : plan.price}
									</span>
									{plan.price > 0 && (
										<span className="text-muted-foreground">/month</span>
									)}
								</div>
								{hasPromotion && plan.promotion_percent_off && (
									<div className="mt-2">
										<span className="text-sm line-through text-muted-foreground">
											${originalPrice.toFixed(0)}/mo
										</span>
										<span className="ml-2 text-sm font-medium text-primary">
											{plan.promotion_percent_off}% off first {plan.promotion_months} months
										</span>
									</div>
								)}
							</div>

							{/* Quick View Features */}
							{quickView.length > 0 && (
								<ul className="space-y-3 mb-6 flex-grow">
									{quickView.map((feature, idx) => (
										<li key={idx} className="flex items-start gap-3">
											<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
											<span className="text-sm leading-relaxed">{feature}</span>
										</li>
									))}
								</ul>
							)}

							{/* Detailed Description */}
							{plan.detailed_description && (
								<div
									className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/40 transition-colors"
									onClick={() => toggleDescription(plan.id)}
								>
									<p className="text-sm text-muted-foreground leading-relaxed">
										{expandedDescriptions[plan.id]
											? plan.detailed_description
											: getFirstSentence(plan.detailed_description)}
										{!expandedDescriptions[plan.id] && plan.detailed_description !== getFirstSentence(plan.detailed_description) && (
											<span className="text-primary ml-1">Read more</span>
										)}
										{expandedDescriptions[plan.id] && (
											<span className="text-primary ml-1">Show less</span>
										)}
									</p>
								</div>
							)}

							{/* CTA Button */}
							<Button
								className="w-full mt-auto"
								onClick={() => handleSelectPlan(plan.id)}
								disabled={isCurrentPlan || processingPlanId === plan.id}
								variant={isCurrentPlan ? "outline" : "default"}
							>
								{processingPlanId === plan.id ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : isCurrentPlan ? (
									"Current Plan"
								) : (
									"Select Plan"
								)}
							</Button>
						</div>
					);
				})}
			</div>

			{/* Invite-Only Plans - Only show under Personal tab */}
			{selectedType === 'regular' && inviteOnlyPlans.length > 0 && (
				<div className="mt-16">
					<div className={cn(
						"grid gap-8 max-w-md mx-auto",
						inviteOnlyPlans.length === 2 && "md:grid-cols-2 max-w-4xl"
					)}>
						{inviteOnlyPlans.map((plan) => {
							const isCurrentPlan = currentSubscription?.planId === plan.id;
							const Icon = getPlanIcon(plan);
							const quickView = parseQuickView(plan.quick_view_json);

							return (
								<div
									key={plan.id}
									className={cn(
										"relative flex flex-col rounded-xl border bg-card p-8 shadow-sm transition-all duration-300",
										"hover:shadow-xl hover:scale-[1.02]",
										"border-primary/30 bg-gradient-to-br from-primary/5 to-transparent",
										isCurrentPlan && "border-primary"
									)}
								>
									{/* Invite Only Badge */}
									<div className="absolute top-4 right-4 z-10">
										<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
											<Sparkles className="h-3 w-3" />
											Invite Only
										</span>
									</div>

									{/* Icon & Name */}
									<div className="mb-6">
										<Icon className="h-8 w-8 text-primary mb-4" />
										<h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
										{plan.tagline && (
											<p className="text-sm text-muted-foreground">
												{plan.tagline}
											</p>
										)}
									</div>

									{/* Price */}
									<div className="mb-6">
										<div className="flex items-baseline gap-2">
											<span className="text-4xl font-bold">
												${plan.price === 0 ? 'Custom' : plan.price}
											</span>
											{plan.price > 0 && (
												<span className="text-muted-foreground">/month</span>
											)}
										</div>
									</div>

									{/* Quick View Features */}
									{quickView.length > 0 && (
										<ul className="space-y-3 mb-6 flex-grow">
											{quickView.map((feature, idx) => (
												<li key={idx} className="flex items-start gap-3">
													<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
													<span className="text-sm leading-relaxed">{feature}</span>
												</li>
											))}
										</ul>
									)}

									{/* Detailed Description */}
									{plan.detailed_description && (
										<div
											className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/40 transition-colors"
											onClick={() => toggleDescription(plan.id)}
										>
											<p className="text-sm text-muted-foreground leading-relaxed">
												{expandedDescriptions[plan.id]
													? plan.detailed_description
													: getFirstSentence(plan.detailed_description)}
												{!expandedDescriptions[plan.id] && plan.detailed_description !== getFirstSentence(plan.detailed_description) && (
													<span className="text-primary ml-1">Read more</span>
												)}
												{expandedDescriptions[plan.id] && (
													<span className="text-primary ml-1">Show less</span>
												)}
											</p>
										</div>
									)}

									{/* CTA Button */}
									<Button
										className="w-full mt-auto"
										variant="outline"
										onClick={() => router.push('/contact')}
									>
										Contact Us
									</Button>

									<p className="text-xs text-center text-muted-foreground mt-3">
										Available by invitation only
									</p>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
