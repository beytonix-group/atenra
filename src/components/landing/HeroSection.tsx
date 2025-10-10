"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Logo } from "@/components/ui/logo";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
	return (
		<div className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Adaptive Background */}
			<div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-background to-primary/5">
				<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
			</div>

			{/* Content */}
			<div className="relative z-10 text-center space-y-8 max-w-6xl mx-auto px-4 py-20">
				<div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
					{/* Vertical Logo with Wordmark */}
					<div className="relative">
						<div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full" />
						<Logo size={384} className="relative h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80" />
					</div>

					{/* Headline */}
					<div className="space-y-4">
						<h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight tracking-tight">
							Atenra
						</h1>

						{/* Tagline */}
						<p className="text-xl md:text-2xl lg:text-3xl text-foreground font-light mt-4 max-w-3xl mx-auto">
							Your Personal & Business Assistant, On Demand
						</p>

						{/* Subheadline */}
						<p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
							Discover trusted professionals through intelligent matching — where technology meets genuine human insight.
						</p>
					</div>
				</div>

				{/* Body Copy */}
				<div className="space-y-6 animate-fade-in-up animation-delay-200 max-w-4xl mx-auto">
					<p className="text-lg md:text-xl text-muted-foreground font-light leading-loose">
						At Atenra, every connection is <span className="text-foreground font-medium">hand-verified, thoughtfully matched, and designed to make your life easier</span>.
						Whether it&apos;s managing your business, your home, or your next big project — we connect you with professionals
						who deliver results.
					</p>
				</div>

				{/* CTA Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up animation-delay-400">
					<Link href="/pricing?type=regular">
						<Button size="lg" className="text-lg px-8 py-6 font-light hover:scale-105 transition-all shadow-lg hover:shadow-xl">
							Get Started
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<Link href="/pricing?type=business">
						<Button size="lg" variant="outline" className="text-lg px-8 py-6 font-light hover:scale-105 transition-all">
							Partner With Us
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