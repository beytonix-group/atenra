"use client";

import { ChevronDown, ChevronUp, Shield, MapPin, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Link from "next/link";

export function FAQ() {
	const { nt } = useLanguage();
	const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));
	const [isVisible, setIsVisible] = useState(false);
	const sectionRef = useRef<HTMLDivElement>(null);

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

	const toggleExpanded = (index: number) => {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		setExpandedItems(newExpanded);
	};

	return (
		<div ref={sectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			{/* Main FAQ Section */}
			<div className="lg:col-span-2">
				<div className="space-y-4">
					{nt.faq.questions.map((faq, index) => {
						const isExpanded = expandedItems.has(index);
						return (
							<div
								key={index}
								className={`rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
								style={{ transitionDelay: `${index * 100}ms` }}
							>
								<div
									className="flex flex-col space-y-1.5 p-6 cursor-pointer hover:bg-muted/25 transition-colors duration-200"
									onClick={() => toggleExpanded(index)}
								>
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-medium text-left pr-4">
											{faq.question}
										</h3>
										{isExpanded ? (
											<ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
										) : (
											<ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
										)}
									</div>
								</div>
								{isExpanded && (
									<div className="p-6 pt-0">
										<p className="text-muted-foreground font-light leading-loose">
											{faq.answer}
										</p>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Sidebar */}
			<div className={`space-y-6 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
				{/* Legal & Privacy */}
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">{nt.faq.sidebar.legal.title}</h3>
					<div className="space-y-3">
						{nt.faq.sidebar.legal.links.map((link) => (
							<Link key={link.href} href={link.href} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
								→ {link.label}
							</Link>
						))}
					</div>
				</div>

				{/* Features */}
				<div className="rounded-lg border bg-gradient-to-br from-primary/5 to-background p-6">
					<h3 className="text-lg font-semibold mb-4">{nt.faq.sidebar.features.title}</h3>
					<div className="space-y-3">
						{nt.faq.sidebar.features.items.map((feature, index) => (
							<div key={index} className="flex items-start gap-3">
								{index === 0 && <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />}
								{index === 1 && <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />}
								{index === 2 && <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />}
								<div className="text-sm">
									<span className="font-medium">{feature.title}</span>
									<p className="text-muted-foreground">{feature.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
