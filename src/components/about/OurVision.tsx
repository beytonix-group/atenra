"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function OurVision() {
	const [isVisible, setIsVisible] = useState(false);
	const sectionRef = useRef<HTMLElement>(null);

	const visionPoints = [
		"Finding help is effortless — Powered by smart tools and human guidance",
		"Privacy is standard, not optional",
		"Every interaction builds confidence, not confusion",
		"Growth is mutual — When our users succeed, so do we"
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
		<section ref={sectionRef} className="py-12 md:py-16 bg-muted/20 relative overflow-hidden">
			{/* Background gradient orb */}
			<div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
			<div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

			{/* Decorative element */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />

			<div className="max-w-6xl mx-auto px-4 relative">
				<div className={`text-center mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h2 className="text-3xl md:text-4xl font-light mb-4">Our Vision</h2>
				</div>

				<div className="max-w-4xl mx-auto space-y-6">
					<p className={`text-base md:text-lg text-muted-foreground leading-loose transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						Atenra was built on one principle — that <span className="text-foreground font-medium">real connection creates better outcomes</span>. Our vision is to redefine how
						people and businesses find reliable help by blending intelligent systems with genuine human understanding.
					</p>

					<p className={`text-base md:text-lg text-muted-foreground leading-loose transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						We believe technology should simplify decisions, not replace trust. Every service, every match, and every
						partnership is built around transparency, efficiency, and measurable results.
					</p>

					<div className={`pt-4 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						<h3 className="text-lg font-semibold mb-4">We&apos;re creating a world where:</h3>
						<ul className="space-y-3">
							{visionPoints.map((point, index) => (
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
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-border via-transparent to-transparent" />
		</section>
	);
}
