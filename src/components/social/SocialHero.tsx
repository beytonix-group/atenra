"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SocialHero() {
	const { t } = useLanguage();
	
	return (
		<section className="py-12 md:py-16 text-center">
			<div className="max-w-4xl mx-auto px-4">
				<h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8">
					{t.social.title}
				</h1>
				
				<p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
					{t.social.subtitle}
				</p>
			</div>
		</section>
	);
}