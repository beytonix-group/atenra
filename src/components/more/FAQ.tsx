"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const faqs = [
	{
		question: "How does Atenra's matching process work?",
		answer: "Our expert team manually reviews each request and matches you with pre-verified service providers based on your specific needs, location, and preferences. We don't use algorithms—every match is human-curated for quality."
	},
	{
		question: "What makes Atenra different from other service platforms?",
		answer: "Unlike automated platforms, every Atenra match is curated by real people who understand local markets and service quality. We prioritize privacy, never sell your data, and focus on long-term relationships rather than quick transactions.",
		expanded: true
	},
	{
		question: "How quickly can I get matched with a service provider?",
		answer: "Most matches are completed within 24-48 hours. For urgent requests, our premium tiers offer expedited matching within 2-6 hours depending on availability and location."
	},
	{
		question: "What if I'm not satisfied with a match?",
		answer: "We offer a 100% satisfaction guarantee. If you're not happy with a match, we'll find you a new provider at no additional cost. For premium tiers, we also offer full refunds if we can't find a suitable alternative."
	},
	{
		question: "How does pricing work?",
		answer: "We offer transparent tier-based pricing starting with free access. Paid tiers unlock additional features like priority matching, advanced analytics, and dedicated support. No hidden fees or commission on services."
	},
	{
		question: "Is my personal information secure?",
		answer: "Absolutely. We use end-to-end encryption, never sell your data, and only use information internally to improve our matching service. Your privacy is our top priority."
	}
];

export function FAQ() {
	const { t } = useLanguage();
	const [expandedItems, setExpandedItems] = useState<Set<number>>(
		new Set(faqs.map((faq, index) => faq.expanded ? index : -1).filter(i => i >= 0))
	);

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
		<div>
			<h2 className="text-3xl font-light mb-6">{t.more.faq}</h2>
			<div className="space-y-4">
				{faqs.map((faq, index) => {
					const isExpanded = expandedItems.has(index);
					return (
						<div
							key={index}
							className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm"
						>
							<div
								className="flex flex-col space-y-1.5 p-6 cursor-pointer hover:bg-muted/25 transition-colors duration-200"
								onClick={() => toggleExpanded(index)}
							>
								<div className="flex items-center justify-between">
									<h3 className="text-lg font-light text-left pr-4">
										{faq.question}
									</h3>
									{isExpanded ? (
										<ChevronUp className="h-5 w-5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
									) : (
										<ChevronDown className="h-5 w-5 text-amber-700 dark:text-amber-400 flex-shrink-0" />
									)}
								</div>
							</div>
							{isExpanded && (
								<div className="p-6 pt-0">
									<p className="text-muted-foreground font-light leading-relaxed">
										{faq.answer}
									</p>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}