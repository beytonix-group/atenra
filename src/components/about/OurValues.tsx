"use client";

import { Shield, Users, CheckCircle, Zap, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function OurValues() {
	const { nt } = useLanguage();
	const [isVisible, setIsVisible] = useState(false);
	const sectionRef = useRef<HTMLElement>(null);

	const values = [
		{
			icon: Shield,
			title: nt.about.values.items[0].title,
			description: nt.about.values.items[0].description,
			color: "from-blue-500/10 to-blue-600/10",
			iconColor: "text-blue-600 dark:text-blue-400"
		},
		{
			icon: Users,
			title: nt.about.values.items[1].title,
			description: nt.about.values.items[1].description,
			color: "from-purple-500/10 to-purple-600/10",
			iconColor: "text-purple-600 dark:text-purple-400"
		},
		{
			icon: CheckCircle,
			title: nt.about.values.items[2].title,
			description: nt.about.values.items[2].description,
			color: "from-green-500/10 to-green-600/10",
			iconColor: "text-green-600 dark:text-green-400"
		},
		{
			icon: Zap,
			title: nt.about.values.items[3].title,
			description: nt.about.values.items[3].description,
			color: "from-yellow-500/10 to-yellow-600/10",
			iconColor: "text-yellow-600 dark:text-yellow-400"
		},
		{
			icon: TrendingUp,
			title: nt.about.values.items[4].title,
			description: nt.about.values.items[4].description,
			color: "from-orange-500/10 to-orange-600/10",
			iconColor: "text-orange-600 dark:text-orange-400"
		}
	];

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

	return (
		<section ref={sectionRef} className="py-12 md:py-16 bg-muted/20 relative">
			{/* Decorative element */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />

			<div className="max-w-6xl mx-auto px-4">
				<div className={`text-center mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h2 className="text-3xl md:text-4xl font-light mb-4">{nt.about.values.title}</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
					{values.map((value, index) => {
						const Icon = value.icon;
						return (
							<div
								key={index}
								className={`text-center group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
								style={{ transitionDelay: `${index * 100 + 200}ms` }}
							>
								<div className="flex justify-center mb-4">
									<div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
										<Icon className={`h-6 w-6 ${value.iconColor}`} />
									</div>
								</div>
								<h3 className="text-lg font-semibold mb-2">{value.title}</h3>
								<p className="text-muted-foreground leading-relaxed text-sm">
									{value.description}
								</p>
							</div>
						);
					})}
				</div>
			</div>

			{/* Connecting line decoration */}
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
		</section>
	);
}