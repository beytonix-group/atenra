"use client";

import { Navigation } from "@/components/landing/Navigation";
import { FAQ } from "@/components/more/FAQ";
import { FooterSection } from "@/components/landing/FooterSection";
import { useLanguage } from "@/lib/i18n/LanguageContext";


export default function FAQPage() {
	const { nt } = useLanguage();

	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-24 pb-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="mb-12">
						<h1 className="text-4xl md:text-5xl font-light mb-4">{nt.faq.title}</h1>
						<p className="text-lg text-muted-foreground font-light leading-loose">
							{nt.faq.subtitle}
						</p>
					</div>
					<FAQ />
				</div>
			</div>
			<FooterSection />
		</main>
	);
}
