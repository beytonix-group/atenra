"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Logo } from "@/components/ui/logo";

export function HeroSection() {
	const { t } = useLanguage();

	return (
		<div className="relative min-h-screen flex items-center justify-center py-20">
			<div className="text-center space-y-8 max-w-5xl mx-auto px-4">
				<div className="flex flex-col items-center justify-center space-y-8">
					<Logo size={384} className="h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96" />
					<div>
						<h1 className="text-5xl md:text-6xl lg:text-7xl font-extralight tracking-tight">
							{t.hero.title}
						</h1>
						<p className="text-xl md:text-2xl text-muted-foreground font-light mt-4">
							{t.hero.subtitle}
						</p>
					</div>
				</div>

				<div className="space-y-6 animate-fade-in-up animation-delay-200">
					<p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-foreground/90">
						{t.hero.description}
					</p>
					<p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
						{t.hero.mainDescription}
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up animation-delay-400">
					<Link href="/register">
						<Button size="lg" className="text-lg px-8 py-6 font-light hover:scale-105 transition-transform">
							{t.hero.getStartedFree}
						</Button>
					</Link>
					<Link href="/business-registration">
						<Button size="lg" variant="outline" className="text-lg px-8 py-6 font-light hover:scale-105 transition-transform">
							{t.hero.partnerWithUs}
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}