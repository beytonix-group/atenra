"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ArrowRight, ChevronDown, ChevronUp, Home, Truck, Heart, Briefcase, Laptop } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Service {
	name: string;
	image?: string;
}

interface ServiceCategory {
	title: string;
	icon: any;
	services: Service[];
	mainImage: string;
}

export function ServicesShowcase() {
	const { nt } = useLanguage();
	const [isVisible, setIsVisible] = useState(false);
	const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
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

	const categories: ServiceCategory[] = [
		{
			title: nt.industries.categories.home.title,
			icon: Home,
			mainImage: "/images/carpenter.jpg",
			services: nt.industries.categories.home.services.map((name, idx) => {
				const images = ["/images/electritian.jpg", "/images/electritian.jpg", "/images/carpenter.jpg", "/images/landscaping.jpg", "/images/construction.jpg"];
				return { name, image: images[idx] };
			})
		},
		{
			title: nt.industries.categories.logistics.title,
			icon: Truck,
			mainImage: "/images/luxTransport.jpg",
			services: nt.industries.categories.logistics.services.map((name, idx) => ({
				name,
				image: idx === 3 ? "/images/luxTransport.jpg" : undefined
			}))
		},
		{
			title: nt.industries.categories.wellness.title,
			icon: Heart,
			mainImage: "/images/healthcare.jpg",
			services: nt.industries.categories.wellness.services.map((name, idx) => ({
				name,
				image: idx === 3 ? "/images/healthcare.jpg" : undefined
			}))
		},
		{
			title: nt.industries.categories.professional.title,
			icon: Briefcase,
			mainImage: "/images/legal.jpg",
			services: nt.industries.categories.professional.services.map((name, idx) => {
				const images = ["/images/wealthManagment.jpg", "/images/legal.jpg", undefined, undefined, "/images/personalAssistant.jpg"];
				return { name, image: images[idx] as string | undefined };
			})
		},
		{
			title: nt.industries.categories.tech.title,
			icon: Laptop,
			mainImage: "/images/techDev.jpg",
			services: nt.industries.categories.tech.services.map((name, idx) => {
				const images = ["/images/techDev.jpg", undefined, undefined, "/images/techDev.jpg", undefined];
				return { name, image: images[idx] as string | undefined };
			})
		}
	];

	const toggleCategory = (index: number) => {
		setExpandedCategory(expandedCategory === index ? null : index);
	};

	return (
		<section ref={sectionRef} className="py-20 bg-muted/20 relative">

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h2 className="text-4xl md:text-5xl font-light mb-4">
						{nt.industries.title}
					</h2>
					<p className="text-xl text-muted-foreground font-light leading-loose max-w-2xl mx-auto">
						{nt.industries.subtitle}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{categories.map((category, index) => {
						const Icon = category.icon;
						const isExpanded = expandedCategory === index;

						return (
							<div
								key={index}
								className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
								style={{ transitionDelay: `${index * 100 + 200}ms` }}
							>
								<Card className="overflow-hidden border-0 shadow-lg">
									<CardContent className="p-0">
										{/* Main Category Card */}
										<div
											className="relative h-64 overflow-hidden cursor-pointer group"
											onClick={() => toggleCategory(index)}
										>
											<Image
												src={category.mainImage}
												alt={category.title}
												fill
												className="object-cover group-hover:scale-110 transition-transform duration-500"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
											<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
												<div className="flex items-center gap-3 mb-2">
													<Icon className="h-6 w-6" />
													<h3 className="text-2xl font-medium">{category.title}</h3>
												</div>
												<div className="flex items-center justify-between">
													<p className="text-sm text-white/90">{category.services.length} services</p>
													{isExpanded ? (
														<ChevronUp className="h-5 w-5" />
													) : (
														<ChevronDown className="h-5 w-5" />
													)}
												</div>
											</div>
										</div>

										{/* Expanded Services List */}
										<div
											className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
												}`}
										>
											<div className="bg-card p-6 border-t">
												<ul className="space-y-3">
													{category.services.map((service, serviceIndex) => (
														<li
															key={serviceIndex}
															className="flex items-center gap-3 text-sm hover:text-primary transition-colors cursor-pointer"
														>
															<ArrowRight className="h-4 w-4 flex-shrink-0" />
															<span>{service.name}</span>
														</li>
													))}
												</ul>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						);
					})}
				</div>

				<div className={`text-center mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<Link
						href="/marketplace"
						className="inline-flex items-center text-lg text-primary hover:underline"
					>
						{nt.industries.viewAll}
						<ArrowRight className="ml-2 h-5 w-5" />
					</Link>
				</div>
			</div>

			{/* Decorative element */}

		</section>
	);
}
