"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ServicesShowcase() {
	const { t } = useLanguage();
	const [isVisible, setIsVisible] = useState(false);
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.1 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const services = [
		{
			title: "Legal Services",
			description: "Expert legal counsel and arbitration services",
			image: "/images/legal.jpg",
			href: "/marketplace"
		},
		{
			title: "Healthcare",
			description: "Professional healthcare and wellness services",
			image: "/images/healthcare.jpg",
			href: "/marketplace"
		},
		{
			title: "Construction",
			description: "Quality construction and renovation services",
			image: "/images/construction.jpg",
			href: "/marketplace"
		},
		{
			title: "Real Estate",
			description: "Premium property services and consultation",
			image: "/images/realEstate.jpg",
			href: "/marketplace"
		},
		{
			title: "Technology",
			description: "Cutting-edge tech development solutions",
			image: "/images/techDev.jpg",
			href: "/marketplace"
		},
		{
			title: "Hospitality",
			description: "Exceptional hospitality and event services",
			image: "/images/hospitality.jpg",
			href: "/marketplace"
		}
	];

	return (
		<section ref={sectionRef} className="py-20 bg-muted/20 relative">
			{/* Decorative element */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h2 className="text-4xl md:text-5xl font-light mb-4">
						{t.about.supportedServices}
					</h2>
					<p className="text-xl text-muted-foreground font-light leading-loose max-w-2xl mx-auto">
						Connect with <span className="text-foreground font-medium">verified professionals</span> across multiple industries
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{services.map((service, index) => (
						<Link key={index} href={service.href}>
							<Card
								className={`group overflow-hidden hover:shadow-xl transition-all duration-700 border-0 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
								style={{ transitionDelay: `${index * 100 + 200}ms` }}
							>
								<CardContent className="p-0">
									<div className="relative h-64 overflow-hidden">
										<Image
											src={service.image}
											alt={service.title}
											fill
											className="object-cover group-hover:scale-110 transition-transform duration-500"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
										<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
											<h3 className="text-2xl font-medium mb-2 flex items-center justify-between">
												{service.title}
												<ArrowRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
											</h3>
											<p className="text-sm text-white/90">{service.description}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>

				<div className={`text-center mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<Link
						href="/marketplace"
						className="inline-flex items-center text-lg text-primary hover:underline"
					>
						View all services
						<ArrowRight className="ml-2 h-5 w-5" />
					</Link>
				</div>
			</div>

			{/* Decorative element */}
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-border via-transparent to-transparent" />
		</section>
	);
}
