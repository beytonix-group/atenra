"use client";

import { Shield, Users, Zap, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function OurValues() {
	const { t } = useLanguage();
	
	const values = [
		{
			icon: Shield,
			title: t.about.values.privacy.title,
			description: t.about.values.privacy.description
		},
		{
			icon: Users,
			title: t.about.values.human.title,
			description: t.about.values.human.description
		},
		{
			icon: Zap,
			title: t.about.values.efficiency.title,
			description: t.about.values.efficiency.description
		},
		{
			icon: Clock,
			title: t.about.values.reliability.title,
			description: t.about.values.reliability.description
		}
	];
	return (
		<section className="py-20 md:py-32">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-light mb-6">{t.about.ourValues}</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{values.map((value, index) => {
						const Icon = value.icon;
						return (
							<div key={index} className="text-center group">
								<div className="flex justify-center mb-6">
									<div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<Icon className="h-8 w-8 text-orange-600" />
									</div>
								</div>
								<h3 className="text-xl font-semibold mb-3">{value.title}</h3>
								<p className="text-muted-foreground leading-relaxed text-sm">
									{value.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}