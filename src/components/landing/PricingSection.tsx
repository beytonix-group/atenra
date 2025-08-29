"use client";

import { Check, Star, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PricingTier {
	name: string;
	tier: string;
	description: string;
	price: string;
	period: string;
	icon: React.ElementType;
	features: string[];
	highlighted?: boolean;
	popular?: boolean;
	buttonText: string;
	buttonVariant?: "default" | "outline" | "ghost";
}

export function PricingSection() {
	const { t } = useLanguage();
	
	const pricingTiers: PricingTier[] = [
		{
			name: t.pricing.tiers.guest.name,
			tier: "TIER 4",
			description: t.pricing.tiers.guest.description,
			price: "0",
			period: t.pricing.freeForever,
			icon: Star,
			features: t.pricing.tiers.guest.features,
			buttonText: t.pricing.tiers.guest.button,
			buttonVariant: "outline"
		},
		{
			name: t.pricing.tiers.essentials.name,
			tier: "TIER 3",
			description: t.pricing.tiers.essentials.description,
			price: "49",
			period: t.pricing.perMonth,
			icon: Zap,
			features: t.pricing.tiers.essentials.features,
			highlighted: true,
			popular: true,
			buttonText: t.pricing.tiers.essentials.button,
			buttonVariant: "default"
		},
		{
			name: t.pricing.tiers.premium.name,
			tier: "TIER 2",
			description: t.pricing.tiers.premium.description,
			price: "99",
			period: t.pricing.perMonth,
			icon: Shield,
			features: t.pricing.tiers.premium.features,
			buttonText: t.pricing.tiers.premium.button,
			buttonVariant: "outline"
		},
		{
			name: t.pricing.tiers.executive.name,
			tier: "TIER 1",
			description: t.pricing.tiers.executive.description,
			price: "199",
			period: t.pricing.perMonth,
			icon: Crown,
			features: t.pricing.tiers.executive.features,
			buttonText: t.pricing.tiers.executive.button,
			buttonVariant: "outline"
		}
	];

	return (
		<section className="py-24 md:py-32 relative">
			<div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />
			
			<div className="relative">
				<div className="text-center mb-16 space-y-4">
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
						{t.pricing.title}
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						{t.pricing.subtitle}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
					{pricingTiers.map((tier, index) => {
						const Icon = tier.icon;
						return (
							<div
								key={index}
								className={cn(
									"relative group",
									tier.highlighted && "lg:scale-110 z-10"
								)}
							>
								{tier.popular && (
									<div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
										<span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 text-xs font-semibold rounded-full">
											{t.pricing.mostPopular}
										</span>
									</div>
								)}
								
								<div className={cn(
									"relative flex flex-col h-full p-8 bg-card rounded-2xl border transition-all duration-300",
									"hover:shadow-2xl hover:-translate-y-1",
									tier.highlighted ? "border-primary shadow-xl bg-gradient-to-b from-card to-card/50" : "border-border shadow-lg",
									"backdrop-blur-sm"
								)}>
									<div className="flex items-center justify-between mb-6">
										<span className="text-xs font-semibold text-muted-foreground tracking-wider bg-muted/50 px-2 py-1 rounded">
											{tier.tier}
										</span>
										<div className={cn(
											"p-2 rounded-lg",
											tier.highlighted ? "bg-primary/10" : "bg-muted/50"
										)}>
											<Icon className={cn(
												"h-5 w-5",
												tier.highlighted ? "text-primary" : "text-muted-foreground"
											)} />
										</div>
									</div>
									
									<h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
									<p className="text-sm text-muted-foreground mb-6 flex-grow">{tier.description}</p>
									
									<div className="mb-8">
										<div className="flex items-baseline mb-2">
											<span className="text-5xl font-bold">${tier.price}</span>
											{tier.price !== "0" && (
												<span className="text-lg text-muted-foreground ml-1">/mo</span>
											)}
										</div>
										<span className="text-sm text-muted-foreground">{tier.period}</span>
									</div>
									
									<ul className="space-y-4 mb-8 flex-grow">
										{tier.features.map((feature, featureIndex) => (
											<li key={featureIndex} className="flex items-start">
												<div className={cn(
													"flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 mr-3",
													tier.highlighted ? "bg-primary/10" : "bg-muted"
												)}>
													<Check className={cn(
														"h-3 w-3",
														tier.highlighted ? "text-primary" : "text-green-500"
													)} />
												</div>
												<span className="text-sm text-foreground">
													{feature}
												</span>
											</li>
										))}
									</ul>
									
									<Link href="/register" className="w-full">
										<Button
											variant={tier.buttonVariant}
											className={cn(
												"w-full font-semibold transition-all duration-200 h-12",
												tier.highlighted && "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg"
											)}
											size="lg"
										>
											{tier.buttonText}
										</Button>
									</Link>
								</div>
							</div>
						);
					})}
				</div>

				<div className="mt-24 relative">
					<div className="absolute inset-0 bg-gradient-to-r from-secondary/10 via-primary/5 to-secondary/10 rounded-3xl blur-2xl" />
					<div className="relative bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 p-8 md:p-12 max-w-4xl mx-auto shadow-2xl">
						<div className="grid md:grid-cols-2 gap-8 items-center">
							<div>
								<h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
									{t.pricing.business.title}
								</h3>
								<p className="text-muted-foreground mb-6 text-lg">
									{t.pricing.business.description}
								</p>
								<ul className="space-y-3">
									{t.pricing.business.features.map((feature, i) => (
										<li key={i} className="flex items-center text-sm">
											<div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mr-3">
												<Check className="h-3 w-3 text-green-600" />
											</div>
											{feature}
										</li>
									))}
								</ul>
							</div>
							<div className="text-center md:text-right">
								<div className="mb-6">
									<span className="text-5xl font-bold">$180</span>
									<span className="text-muted-foreground ml-2 text-lg">{t.pricing.perMonth}</span>
								</div>
								<Link href="/business-registration">
									<Button size="lg" className="font-semibold h-12 px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
										{t.pricing.business.button}
									</Button>
								</Link>
								<p className="text-xs text-muted-foreground mt-4">
									{t.pricing.business.disclaimer}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}