"use client";

import { useState, useEffect } from "react";
import { Check, GraduationCap, Users, Briefcase, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PlanFromDB {
	id: number;
	name: string;
	plan_type: 'student' | 'regular' | 'business';
	tagline: string | null;
	description: string | null;
	detailed_description: string | null;
	price: number;
	currency: string;
	billing_period: string;
	quick_view_json: string | null;
	industries_json: string | null;
	trial_days: number;
	has_promotion: number;
	promotion_percent_off: number | null;
	promotion_months: number | null;
	is_invite_only: number;
	has_refund_guarantee: number;
}

type PlanType = 'student' | 'regular' | 'business';

export function PricingSection() {
	const [selectedType, setSelectedType] = useState<PlanType>('regular');
	const [plans, setPlans] = useState<PlanFromDB[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch plans from database on mount
	useEffect(() => {
		const fetchPlans = async () => {
			try {
				const response = await fetch("/api/plans");
				const data = await response.json() as { success?: boolean; plans?: PlanFromDB[] };

				console.log("API Response:", data);
				console.log("Plans data:", data.plans);
				console.log("Plans count:", data.plans?.length);

				if (data.success && data.plans) {
					setPlans(data.plans);
				}
			} catch (error) {
				console.error("Error fetching plans:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPlans();
	}, []);

	// Filter plans by selected type (include invite-only plans)
	const filteredPlans = plans.filter(plan => plan.plan_type === selectedType);

	console.log("Selected Type:", selectedType);
	console.log("Filtered Plans:", filteredPlans);
	console.log("Filtered Plans count:", filteredPlans.length);

	// Parse JSON fields
	const parseQuickView = (plan: PlanFromDB): string[] => {
		if (!plan.quick_view_json) return [];
		try {
			return JSON.parse(plan.quick_view_json);
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

	const getPlanIcon = (plan: PlanFromDB) => {
		if (plan.is_invite_only) return Sparkles;
		if (plan.price >= 200) return Crown;
		return getIcon(plan.plan_type);
	};

	return (
		<section className="py-12 md:py-16">
			<div>
				{/* Header */}
				<div className="text-center mb-12 space-y-4">
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
						Choose Your Plan
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Transparent pricing for everyone
					</p>
				</div>

				{/* Plan Type Toggle */}
				<div className="flex justify-center mb-12">
					<div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
						<button
							onClick={() => setSelectedType('student')}
							className={cn(
								"flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all",
								selectedType === 'student'
									? "bg-background shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<GraduationCap className="h-4 w-4" />
							Student
						</button>
						<button
							onClick={() => setSelectedType('regular')}
							className={cn(
								"flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all",
								selectedType === 'regular'
									? "bg-background shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<Users className="h-4 w-4" />
							Personal
						</button>
						<button
							onClick={() => setSelectedType('business')}
							className={cn(
								"flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all",
								selectedType === 'business'
									? "bg-background shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							<Briefcase className="h-4 w-4" />
							Business
						</button>
					</div>
				</div>

				{/* Plans Grid */}
				{loading ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">Loading plans...</p>
					</div>
				) : (
					<div className={cn(
						"grid gap-8",
						filteredPlans.length === 1 ? "max-w-md mx-auto" :
						filteredPlans.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" :
						filteredPlans.length === 3 ? "md:grid-cols-3 max-w-5xl mx-auto" :
						"md:grid-cols-2 lg:grid-cols-4"
					)}>
						{filteredPlans.map((plan) => {
							const Icon = getPlanIcon(plan);
							const quickView = parseQuickView(plan);
							const hasPromotion = plan.has_promotion === 1;
							const originalPrice = hasPromotion && plan.promotion_percent_off
								? plan.price / (1 - plan.promotion_percent_off / 100)
								: plan.price;

							return (
								<div
									key={plan.id}
									className={cn(
										"relative flex flex-col rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md",
										plan.price >= 100 && "border-primary/20"
									)}
								>
									{/* Icon & Name */}
									<div className="mb-6">
										<Icon className="h-8 w-8 text-primary mb-4" />
										<h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
										{plan.tagline && (
											<p className="text-sm text-muted-foreground">{plan.tagline}</p>
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
										{plan.trial_days > 0 && (
											<p className="text-sm text-muted-foreground mt-2">
												{plan.trial_days}-day trial
											</p>
										)}
										{plan.has_refund_guarantee === 1 && (
											<p className="text-sm text-green-600 dark:text-green-400 mt-2">
												Pro-rata refund guarantee
											</p>
										)}
									</div>

									{/* Description */}
									{plan.description && (
										<p className="text-sm text-muted-foreground mb-6 leading-relaxed">
											{plan.description}
										</p>
									)}

									{/* Quick View Features */}
									{quickView.length > 0 && (
										<ul className="space-y-3 mb-8 flex-grow">
											{quickView.map((feature, idx) => (
												<li key={idx} className="flex items-start gap-3">
													<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
													<span className="text-sm leading-relaxed">{feature}</span>
												</li>
											))}
										</ul>
									)}

									{/* CTA Button */}
									<Link href={plan.is_invite_only ? "/contact" : "/register"} className="w-full">
										<Button
											variant={plan.price >= 100 ? "default" : "outline"}
											className="w-full"
											size="lg"
										>
											{plan.is_invite_only ? "Contact Us" : "Get Started"}
										</Button>
									</Link>

									{plan.is_invite_only === 1 && (
										<p className="text-xs text-center text-muted-foreground mt-3">
											Invite only
										</p>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</section>
	);
}