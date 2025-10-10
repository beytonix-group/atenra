"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function AboutHero() {
	const { nt } = useLanguage();

	return (
		<section className="py-8 md:py-12 text-center">
			<div className="max-w-4xl mx-auto px-4">
				<h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4">
					{nt.about.hero.title}
				</h1>

				<p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
					{nt.about.hero.subtitle}
				</p>
			</div>
		</section>
	);
}