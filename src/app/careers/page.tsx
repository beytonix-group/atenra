"use client";

import { Navigation } from "@/components/landing/Navigation";
import { FooterSection } from "@/components/landing/FooterSection";
import { Globe, TrendingUp, Users, Award, Code, Palette, Megaphone, Scale, Headphones, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Image from "next/image";

export default function CareersPage() {
	const { nt } = useLanguage();
	const [isVisible1, setIsVisible1] = useState(false);
	const [isVisible2, setIsVisible2] = useState(false);
	const [isVisible3, setIsVisible3] = useState(false);
	const [isVisible4, setIsVisible4] = useState(false);
	const section1Ref = useRef<HTMLDivElement>(null);
	const section2Ref = useRef<HTMLDivElement>(null);
	const section3Ref = useRef<HTMLDivElement>(null);
	const section4Ref = useRef<HTMLDivElement>(null);

	const departments = [
		{
			icon: Headphones,
			name: nt.careers.opportunities.departments[0],
		},
		{
			icon: Megaphone,
			name: nt.careers.opportunities.departments[1],
		},
		{
			icon: Code,
			name: nt.careers.opportunities.departments[2],
		},
		{
			icon: Palette,
			name: nt.careers.opportunities.departments[3],
		},
		{
			icon: Scale,
			name: nt.careers.opportunities.departments[4],
		},
	];

	useEffect(() => {
		const createObserver = (ref: React.RefObject<HTMLDivElement>, setter: (value: boolean) => void) => {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						setter(true);
					}
				},
				{ threshold: 0.1 }
			);

			if (ref.current) {
				observer.observe(ref.current);
			}

			return observer;
		};

		const observer1 = createObserver(section1Ref, setIsVisible1);
		const observer2 = createObserver(section2Ref, setIsVisible2);
		const observer3 = createObserver(section3Ref, setIsVisible3);
		const observer4 = createObserver(section4Ref, setIsVisible4);

		return () => {
			observer1.disconnect();
			observer2.disconnect();
			observer3.disconnect();
			observer4.disconnect();
		};
	}, []);

	return (
		<main className="min-h-screen bg-background">
			<Navigation />

			{/* Hero Banner */}
			<div className="relative h-[400px] bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
				<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent blur-3xl" />
				<div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
					<h1 className="text-5xl md:text-6xl font-light mb-6">{nt.careers.hero.title}</h1>
					<p className="text-xl md:text-2xl text-muted-foreground font-light leading-loose max-w-3xl">
						{nt.careers.hero.subtitle}
					</p>
				</div>

			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				{/* About Working at Atenra */}
				<div ref={section1Ref} className={`mb-20 transition-all duration-700 ${isVisible1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-4xl font-light mb-6">{nt.careers.about.title}</h2>
							<p className="text-lg text-muted-foreground leading-loose">
								{nt.careers.about.text1} <span className="text-foreground font-medium">{nt.careers.about.highlight}</span> {nt.careers.about.text2}
							</p>
						</div>
						<div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
							<Image
								src="/images/career1.jpg"
								alt="Team collaboration at Atenra"
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 50vw"
							/>
						</div>
					</div>
				</div>

				{/* What We Offer */}
				<div ref={section2Ref} className="mb-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl order-2 lg:order-1">
							<Image
								src="/images/career2.jpg"
								alt="Working environment at Atenra"
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 50vw"
							/>
						</div>
						<div className="order-1 lg:order-2">
							<h2 className={`text-4xl font-light mb-8 transition-all duration-700 ${isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>{nt.careers.benefits.title}</h2>
							<div className="grid grid-cols-1 gap-4">
								{nt.careers.benefits.list.map((benefit, index) => (
									<div
										key={benefit}
										className={`flex items-start gap-3 p-4 rounded-lg border bg-card/50 hover:bg-card transition-all duration-700 ${isVisible2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
										style={{ transitionDelay: `${index * 100 + 200}ms` }}
									>
										<Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
										<span className="text-base">{benefit}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Explore Opportunities */}
				<div ref={section3Ref} className="mb-20 bg-muted/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 relative">
					<div className={`text-center mb-12 transition-all duration-700 ${isVisible3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						<h2 className="text-4xl font-light mb-4">{nt.careers.opportunities.title}</h2>
						<p className="text-lg text-muted-foreground leading-loose max-w-2xl mx-auto">
							{nt.careers.opportunities.subtitle}
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						{departments.map((dept, index) => (
							<div
								key={dept.name}
								className={`rounded-lg border bg-card/50 p-6 hover:shadow-lg transition-all duration-700 ${isVisible3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
								style={{ transitionDelay: `${index * 100 + 300}ms` }}
							>
								<dept.icon className="h-8 w-8 text-primary mb-3" />
								<h3 className="text-lg font-medium">{dept.name}</h3>
							</div>
						))}
					</div>

					<div className={`text-center transition-all duration-700 delay-700 ${isVisible3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						<Button size="lg" className="gap-2" asChild>
							<a href="mailto:careers@atenra.com" target="_blank" rel="noopener noreferrer">
								{nt.careers.opportunities.cta}
								<ExternalLink className="h-4 w-4" />
							</a>
						</Button>
					</div>


				</div>

				{/* Team Culture Section */}
				<div ref={section4Ref} className={`rounded-2xl border bg-gradient-to-br from-primary/5 to-background overflow-hidden transition-all duration-700 ${isVisible4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<div className="grid grid-cols-1 lg:grid-cols-2">
						<div className="p-12 flex flex-col justify-center">
							<h2 className="text-3xl font-light mb-6">{nt.careers.culture.title}</h2>
							<div className="relative">
								<div className="absolute -left-4 top-0 text-primary/20 text-6xl font-serif">&ldquo;</div>
								<p className="text-xl text-muted-foreground leading-loose px-8">
									{nt.careers.culture.quote}
								</p>
								<div className="absolute -right-4 bottom-0 text-primary/20 text-6xl font-serif">&rdquo;</div>
							</div>
						</div>
						<div className="relative h-[400px] lg:h-auto">
							<Image
								src="/images/career3.jpg"
								alt="Team culture at Atenra"
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 50vw"
							/>
						</div>
					</div>
				</div>
			</div>

			<FooterSection />
		</main>
	);
}
