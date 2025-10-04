"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Logo } from "@/components/ui/logo";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
	const { t } = useLanguage();

	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Background Image with Overlay */}
			<div className="absolute inset-0 z-0">
				<Image
					src="/images/hospitality.jpg"
					alt="Hero background"
					fill
					className="object-cover opacity-10 dark:opacity-5"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
			</div>

			{/* Content */}
			<div className="relative z-10 text-center space-y-8 max-w-6xl mx-auto px-4 py-20">
				<div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
					{/* Logo */}
					<div className="relative">
						<div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full" />
						<Logo size={384} className="relative h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80" />
					</div>

					{/* Title Section */}
					<div className="space-y-4">
						<h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight tracking-tight">
							{t.hero.title}
						</h1>
						<p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light mt-4 max-w-3xl mx-auto">
							{t.hero.subtitle}
						</p>
					</div>
				</div>

				<div className="space-y-6 animate-fade-in-up animation-delay-200 max-w-4xl mx-auto">
					<p className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-foreground/90">
						{t.hero.description}
					</p>
					<p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
						{t.hero.mainDescription}
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up animation-delay-400">
					<Link href="/register">
						<Button size="lg" className="text-lg px-8 py-6 font-light hover:scale-105 transition-all shadow-lg hover:shadow-xl">
							{t.hero.getStartedFree}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<Link href="/business-registration">
						<Button size="lg" variant="outline" className="text-lg px-8 py-6 font-light hover:scale-105 transition-all">
							{t.hero.partnerWithUs}
						</Button>
					</Link>
				</div>

				{/* Trust Indicators */}
				<div className="pt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-green-500" />
						<span>1000+ Verified Professionals</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-blue-500" />
						<span>20+ Service Categories</span>
					</div>
				</div>
			</div>

			{/* Decorative Elements */}
			<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
		</div>
	);
}