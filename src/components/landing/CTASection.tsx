"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function CTASection() {
	const { t } = useLanguage();

	return (
		<section className="py-20 bg-primary text-primary-foreground">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
				<h2 className="text-4xl md:text-5xl font-light mb-6">
					Ready to Find Your Perfect Match?
				</h2>
				<p className="text-xl font-light mb-10 text-primary-foreground/90">
					Join thousands of satisfied clients who have discovered exceptional service providers through Atenra
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href="/register">
						<Button
							size="lg"
							variant="secondary"
							className="text-lg px-8 py-6 font-light hover:scale-105 transition-transform"
						>
							{t.hero.getStarted}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<Link href="/business-registration">
						<Button
							size="lg"
							variant="outline"
							className="text-lg px-8 py-6 font-light hover:scale-105 transition-transform border-primary-foreground bg-primary-foreground text-primary hover:bg-primary-foreground/90"
						>
							{t.hero.partnerWithUs}
						</Button>
					</Link>
				</div>

				<p className="mt-8 text-sm text-primary-foreground/70">
					No credit card required • Free to get started • Cancel anytime
				</p>
			</div>
		</section>
	);
}
