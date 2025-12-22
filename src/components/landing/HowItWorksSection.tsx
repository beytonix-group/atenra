"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageSquare, CheckCircle2 } from "lucide-react";

export function HowItWorksSection() {
	const steps = [
		{
			icon: Search,
			number: "01",
			title: "Tell Us What You Need",
			description: "Share your requirements and we'll understand exactly what you're looking for"
		},
		{
			icon: MessageSquare,
			number: "02",
			title: "Get Matched",
			description: "Our team curates the perfect professional match based on your specific needs"
		},
		{
			icon: CheckCircle2,
			number: "03",
			title: "Connect & Complete",
			description: "Connect directly with your matched professional and get the job done right"
		}
	];

	return (
		<section className="py-20 bg-muted/20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-light mb-4">
						How It Works
					</h2>
					<p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
						Three simple steps to finding your ideal service professional
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
					{steps.map((step, index) => {
						const Icon = step.icon;
						return (
							<div key={index} className="relative">
								<Card className="border-0 shadow-sm">
									<CardContent className="p-8 text-center relative">
										<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground mb-6">
											<Icon className="h-10 w-10" />
										</div>
										<div className="absolute top-4 right-4 text-6xl font-light text-muted-foreground/10">
											{step.number}
										</div>
										<h3 className="text-2xl font-medium mb-4">{step.title}</h3>
										<p className="text-muted-foreground leading-relaxed">
											{step.description}
										</p>
									</CardContent>
								</Card>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
