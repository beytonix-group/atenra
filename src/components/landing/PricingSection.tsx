"use client";

import { useState, useEffect, useRef } from "react";
import { Check, GraduationCap, Users, Briefcase, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PlanFromDB {
	id: number;
	name: string;
	plan_type: 'student' | 'regular' | 'business' | 'invite-only';
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

type PlanType = 'student' | 'regular' | 'business' | 'invite-only';

export function PricingSection() {
	const { nt } = useLanguage();
	const searchParams = useSearchParams();
	const typeParam = searchParams.get('type') as PlanType | null;
	const [selectedType, setSelectedType] = useState<PlanType>(typeParam || 'regular');
	const [plans, setPlans] = useState<PlanFromDB[]>([]);
	const [loading, setLoading] = useState(true);
	const [isVisible, setIsVisible] = useState(false);
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.1 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	// Update selected type when URL parameter changes
	useEffect(() => {
		if (typeParam && ['student', 'regular', 'business'].includes(typeParam)) {
			setSelectedType(typeParam);
		}
	}, [typeParam]);

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

	// Filter plans by selected type
	const filteredPlans = plans
		.filter(plan => plan.plan_type === selectedType)
		.sort((a, b) => a.price - b.price);

	// Filter invite-only plans to display separately
	const inviteOnlyPlans = plans
		.filter(plan => plan.plan_type === 'invite-only')
		.sort((a, b) => a.price - b.price);

	console.log("Selected Type:", selectedType);
	console.log("Filtered Plans:", filteredPlans);
	console.log("Filtered Plans count:", filteredPlans.length);
	console.log("Invite-only Plans:", inviteOnlyPlans);

	// Parse JSON fields and translate features
	const parseQuickView = (plan: PlanFromDB): string[] => {
		if (!plan.quick_view_json) return [];
		try {
			const features = JSON.parse(plan.quick_view_json) as string[];
			// Translate each feature if translation exists, otherwise use original
			return features.map(feature => nt.pricing.features[feature] || feature);
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
		<section ref={sectionRef} className="py-12 md:py-16 relative">

			<div>
				{/* Header */}
				<div className={`text-center mb-12 space-y-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
						{nt.pricing.title}
					</h2>
					<p className="text-lg text-muted-foreground leading-loose max-w-2xl mx-auto">
						{nt.pricing.subtitle}
					</p>
				</div>

				{/* Plan Type Toggle */}
				<div className={`flex justify-center mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
							{nt.pricing.planTypes.student}
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
							{nt.pricing.planTypes.personal}
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
							{nt.pricing.planTypes.business}
						</button>
					</div>
				</div>

				{/* Plans Grid */}
				{loading ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">{nt.pricing.loading}</p>
					</div>
				) : (
					<>
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
											"group relative flex flex-col rounded-xl border bg-card p-8 shadow-sm transition-all duration-700",
											"hover:shadow-xl hover:scale-[1.02] hover:border-primary/50",
											"before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
											plan.price >= 100 && "border-primary/20",
											isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
										)}
										style={{ transitionDelay: `${filteredPlans.indexOf(plan) * 100 + 400}ms` }}
									>
										{/* Icon & Name */}
										<div className="relative z-10 mb-6">
											<Icon className="h-8 w-8 text-primary mb-4" />
											<h3 className="text-2xl font-semibold mb-2">
												{nt.pricing.planNames[plan.name] || plan.name}
											</h3>
											{plan.tagline && (
												<p className="text-sm text-muted-foreground">
													{nt.pricing.taglines[plan.tagline] || plan.tagline}
												</p>
											)}
										</div>

										{/* Price */}
										<div className="relative z-10 mb-6">
											<div className="flex items-baseline gap-2">
												<span className="text-4xl font-bold">
													${plan.price === 0 ? nt.pricing.custom : plan.price}
												</span>
												{plan.price > 0 && (
													<span className="text-muted-foreground">{nt.pricing.perMonth}</span>
												)}
											</div>
											{hasPromotion && plan.promotion_percent_off && (
												<div className="mt-2">
													<span className="text-sm line-through text-muted-foreground">
														${originalPrice.toFixed(0)}/mo
													</span>
													<span className="ml-2 text-sm font-medium text-primary">
														{plan.promotion_percent_off}{nt.pricing.offFirstMonths.replace('{months}', String(plan.promotion_months))}
													</span>
												</div>
											)}
											{plan.trial_days > 0 && (
												<p className="text-sm text-muted-foreground mt-2">
													{plan.trial_days}{nt.pricing.dayTrial}
												</p>
											)}
											{plan.has_refund_guarantee === 1 && (
												<p className="text-sm text-green-600 dark:text-green-400 mt-2">
													{nt.pricing.refundGuarantee}
												</p>
											)}
										</div>

										{/* Quick View Features */}
										{quickView.length > 0 && (
											<ul className="relative z-10 space-y-3 mb-6 flex-grow">
												{quickView.map((feature, idx) => (
													<li key={idx} className="flex items-start gap-3">
														<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
														<span className="text-sm leading-relaxed">{feature}</span>
													</li>
												))}
											</ul>
										)}

										{/* Detailed Description - In Detail Section */}
										{plan.detailed_description && (
											<div className="relative z-10 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
												<p className="text-sm text-muted-foreground leading-relaxed">
													{plan.detailed_description}
												</p>
											</div>
										)}

										{/* CTA Button */}
										<Link href={plan.is_invite_only ? "/contact" : "/register"} className="relative z-10 w-full">
											<Button
												variant="outline"
												className="w-full bg-background text-foreground border-2 transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground"
												size="lg"
											>
												{plan.is_invite_only ? nt.pricing.contactUs : nt.pricing.getStarted}
											</Button>
										</Link>

										{plan.is_invite_only === 1 && (
											<p className="relative z-10 text-xs text-center text-muted-foreground mt-3">
												{nt.pricing.inviteOnly}
											</p>
										)}
									</div>
								);
							})}
						</div>

						{/* Invite-Only Plans Section - Only show under Personal tab */}
						{selectedType === 'regular' && inviteOnlyPlans.length > 0 && (
							<div className="mt-16">
								<div className={cn(
									"grid gap-8 max-w-md mx-auto",
									inviteOnlyPlans.length === 2 && "md:grid-cols-2 max-w-4xl"
								)}>
									{inviteOnlyPlans.map((plan) => {
										const Icon = getPlanIcon(plan);
										const quickView = parseQuickView(plan);

										return (
											<div
												key={plan.id}
												className={cn(
													"group relative flex flex-col rounded-xl border bg-card p-8 shadow-sm transition-all duration-700",
													"hover:shadow-xl hover:scale-[1.02] hover:border-primary/50",
													"before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
													"border-primary/30 bg-gradient-to-br from-primary/5 to-transparent",
													isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
												)}
												style={{ transitionDelay: `${(filteredPlans.length + inviteOnlyPlans.indexOf(plan)) * 100 + 400}ms` }}
											>
												{/* Invite Only Badge */}
												<div className="absolute top-4 right-4 z-20">
													<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
														<Sparkles className="h-3 w-3" />
														{nt.pricing.inviteOnlyBadge}
													</span>
												</div>

												{/* Icon & Name */}
												<div className="relative z-10 mb-6">
													<Icon className="h-8 w-8 text-primary mb-4" />
													<h3 className="text-2xl font-semibold mb-2">
														{nt.pricing.planNames[plan.name] || plan.name}
													</h3>
													{plan.tagline && (
														<p className="text-sm text-muted-foreground">
															{nt.pricing.taglines[plan.tagline] || plan.tagline}
														</p>
													)}
												</div>

												{/* Price */}
												<div className="relative z-10 mb-6">
													<div className="flex items-baseline gap-2">
														<span className="text-4xl font-bold">{nt.pricing.custom}</span>
													</div>
													<p className="text-sm text-muted-foreground mt-2">
														{nt.pricing.tailoredPricing}
													</p>
												</div>

												{/* Quick View Features */}
												{quickView.length > 0 && (
													<ul className="relative z-10 space-y-3 mb-6 flex-grow">
														{quickView.map((feature, idx) => (
															<li key={idx} className="flex items-start gap-3">
																<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
																<span className="text-sm leading-relaxed">{feature}</span>
															</li>
														))}
													</ul>
												)}

												{/* Detailed Description - In Detail Section */}
												{plan.detailed_description && (
													<div className="relative z-10 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
														<p className="text-sm text-muted-foreground leading-relaxed">
															{plan.detailed_description}
														</p>
													</div>
												)}

												{/* CTA Button */}
												<Link href="/contact" className="relative z-10 w-full">
													<Button
														variant="outline"
														className="w-full bg-background text-foreground border-2 transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground"
														size="lg"
													>
														{nt.pricing.contactUs}
													</Button>
												</Link>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* Decorative element */}

		</section>
	);
}
