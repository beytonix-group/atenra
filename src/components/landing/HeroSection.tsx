"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function HeroSection() {
	const containerRef = useRef<HTMLDivElement>(null);
	const { t } = useLanguage();

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
			const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
			
			const logo = container.querySelector('.atenra-logo-container') as HTMLElement;
			if (logo) {
				logo.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
			}
		};

		container.addEventListener('mousemove', handleMouseMove);
		return () => container.removeEventListener('mousemove', handleMouseMove);
	}, []);

	return (
		<div ref={containerRef} className="relative min-h-screen flex items-center justify-center py-20">
			<div className="text-center space-y-8 max-w-5xl mx-auto">
				<div className="atenra-logo-container relative inline-block transition-transform duration-300 ease-out">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full scale-150 animate-pulse" />
					<div className="relative">
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-48 h-48 rounded-full border border-primary/20 animate-spin-slow" />
							<div className="absolute w-64 h-64 rounded-full border border-secondary/10 animate-spin-reverse" />
							<div className="absolute w-80 h-80 rounded-full border border-muted/5 animate-spin-slower" />
						</div>
						<h1 className="relative text-7xl md:text-8xl lg:text-9xl font-extralight tracking-tight">
							<span className="bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
								{t.hero.title}
							</span>
						</h1>
					</div>
					<p className="text-xl md:text-2xl text-muted-foreground font-light mt-6 animate-fade-in">
						{t.hero.subtitle}
					</p>
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