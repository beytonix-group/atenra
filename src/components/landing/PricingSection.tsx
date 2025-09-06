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
		<section className="py-12 md:py-16">
			<div>
				<div className="text-center mb-20 space-y-4">
					<h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
						{t.pricing.title}
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{t.pricing.subtitle}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 lg:gap-x-12">
					{pricingTiers.map((tier, index) => {
						const Icon = tier.icon;
						return (
							<div
								key={index}
								className="relative flex flex-col h-full"
							>
								<div className="h-5 mb-4">
									{tier.popular && (
										<span className="text-xs font-medium text-primary uppercase tracking-wider">
											{t.pricing.mostPopular}
										</span>
									)}
								</div>
								
								<div className="flex flex-col h-full">
									<div className="flex items-center gap-3 mb-4">
										<Icon className="h-5 w-5 text-muted-foreground" />
										<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
											{tier.tier}
										</span>
									</div>
									
									<h3 className="text-2xl font-medium mb-3">{tier.name}</h3>
									<p className="text-sm text-muted-foreground mb-8 leading-relaxed">{tier.description}</p>
									
									<div className="mb-8">
										<div className="flex items-baseline gap-1">
											<span className="text-4xl font-light">${tier.price}</span>
											{tier.price !== "0" && (
												<span className="text-sm text-muted-foreground">/mo</span>
											)}
										</div>
										<span className="text-xs text-muted-foreground">{tier.period}</span>
									</div>
									
									<ul className="space-y-3 mb-10 flex-grow">
										{tier.features.map((feature, featureIndex) => (
											<li key={featureIndex} className="flex items-start gap-3">
												<Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
												<span className="text-sm text-foreground leading-relaxed">
													{feature}
												</span>
											</li>
										))}
									</ul>
									
									<Link href="/register" className="w-full">
										<Button
											variant="outline"
											className="w-full font-medium h-11 border-foreground/20 hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
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

				<div className="mt-32">
					<div className="bg-muted/30 p-12 md:p-16 max-w-4xl mx-auto">
						<div className="grid md:grid-cols-2 gap-12 items-center">
							<div>
								<h3 className="text-3xl font-light mb-4">
									{t.pricing.business.title}
								</h3>
								<p className="text-muted-foreground mb-8 leading-relaxed">
									{t.pricing.business.description}
								</p>
								<ul className="space-y-3">
									{t.pricing.business.features.map((feature, i) => (
										<li key={i} className="flex items-start gap-3 text-sm">
											<Check className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
											<span className="leading-relaxed">{feature}</span>
										</li>
									))}
								</ul>
							</div>
							<div className="text-center md:text-right">
								<div className="mb-8">
									<span className="text-4xl font-light">$180</span>
									<span className="text-sm text-muted-foreground ml-2">{t.pricing.perMonth}</span>
								</div>
								<Link href="/business-registration">
									<Button 
										variant="outline" 
										size="lg" 
										className="font-medium h-11 px-8 border-foreground/20 hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
									>
										{t.pricing.business.button}
									</Button>
								</Link>
								<p className="text-xs text-muted-foreground mt-6">
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