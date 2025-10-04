"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Shield, UserCheck, Zap, Award, HeartHandshake, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FeaturesSection() {
	const { t } = useLanguage();

	const features = [
		{
			icon: Shield,
			title: "Verified Professionals",
			description: "All service providers are thoroughly vetted and verified for quality assurance"
		},
		{
			icon: UserCheck,
			title: "Human-First Matching",
			description: "Personal curation ensures the perfect match for your specific needs"
		},
		{
			icon: Zap,
			title: "Fast Response",
			description: "Get connected with top professionals quickly and efficiently"
		},
		{
			icon: Award,
			title: "Quality Guaranteed",
			description: "Premium service providers with proven track records"
		},
		{
			icon: HeartHandshake,
			title: "Trust & Transparency",
			description: "Clear communication and honest pricing from start to finish"
		},
		{
			icon: TrendingUp,
			title: "Continuous Improvement",
			description: "Feedback-driven matching that gets better with every connection"
		}
	];

	return (
		<section className="py-20 bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-light mb-4">
						Why Choose Atenra
					</h2>
					<p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
						Experience the difference of intelligent, human-centered service matching
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
								<CardContent className="p-8">
									<div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
										<Icon className="h-7 w-7 text-primary" />
									</div>
									<h3 className="text-xl font-medium mb-3">{feature.title}</h3>
									<p className="text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
