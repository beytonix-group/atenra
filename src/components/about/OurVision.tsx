"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function OurVision() {
	const { nt } = useLanguage();
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

	return (
		<section ref={sectionRef} className="py-12 md:py-16 bg-muted/20 relative overflow-hidden">
			{/* Background gradient orb */}
			<div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
			<div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

			<div className="max-w-6xl mx-auto px-4 relative">
				<div className={`text-center mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h2 className="text-3xl md:text-4xl font-light mb-4">{nt.about.vision.title}</h2>
				</div>

				<div className="max-w-4xl mx-auto space-y-6">
					<p className={`text-base md:text-lg text-muted-foreground leading-loose transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						{nt.about.vision.text1} <span className="text-foreground font-medium">{nt.about.vision.highlight}</span>. {nt.about.vision.text2}
					</p>

					<p className={`text-base md:text-lg text-muted-foreground leading-loose transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						{nt.about.vision.text3}
					</p>

					<div className={`pt-4 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						<h3 className="text-lg font-semibold mb-4">{nt.about.vision.listTitle}</h3>
						<ul className="space-y-3">
							{nt.about.vision.points.map((point, index) => (
								<li
									key={index}
									className={`flex items-start gap-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
									style={{ transitionDelay: `${index * 100 + 500}ms` }}
								>
									<Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
									<span className="text-sm md:text-base text-muted-foreground leading-relaxed">{point}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			{/* Decorative element */}

		</section>
	);
}
