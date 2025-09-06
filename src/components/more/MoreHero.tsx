"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function MoreHero() {
	const { t } = useLanguage();
	
	return (
		<section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 relative">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<h1 className="text-4xl md:text-5xl font-light text-foreground mb-6 tracking-tight">
						{t.more.title}
					</h1>
					<div className="w-16 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mx-auto mb-8"></div>
					<p className="text-xl text-muted-foreground font-light max-w-4xl mx-auto leading-relaxed">
						{t.more.subtitle}
					</p>
				</div>
			</div>
		</section>
	);
}