"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function OurCommitment() {
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
		<section ref={sectionRef} className="py-12 md:py-16 relative">

			<div className="max-w-6xl mx-auto px-4">
				<div className={`text-center mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h2 className="text-3xl md:text-4xl font-light mb-4">{nt.about.commitment.title}</h2>
				</div>

				<div className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<p className="text-base md:text-lg text-muted-foreground leading-loose text-center">
						{nt.about.commitment.text1} <span className="text-foreground font-medium">{nt.about.commitment.highlight}</span>.
					</p>
				</div>
			</div>
		</section>
	);
}
