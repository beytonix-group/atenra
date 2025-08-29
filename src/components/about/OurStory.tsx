"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function OurStory() {
	const { t } = useLanguage();
	
	return (
		<section className="py-20 md:py-32 bg-muted/20">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-light mb-6">{t.about.ourStory}</h2>
				</div>

				<div className="grid md:grid-cols-2 gap-12 lg:gap-16">
					<div className="space-y-6">
						<div>
							<h3 className="text-2xl font-semibold mb-4 text-orange-600">{t.about.foundedOnTrust.title}</h3>
							<p className="text-muted-foreground leading-relaxed">
								{t.about.foundedOnTrust.description}
							</p>
						</div>
					</div>

					<div className="space-y-6">
						<div>
							<h3 className="text-2xl font-semibold mb-4 text-orange-600">{t.about.humanFirst.title}</h3>
							<p className="text-muted-foreground leading-relaxed">
								{t.about.humanFirst.description}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}