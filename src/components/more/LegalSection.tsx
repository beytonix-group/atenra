"use client";

import { Shield, FileText, Lock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const privacyFeatures = [
	{
		icon: Lock,
		title: "End-to-End Encryption",
		description: "All data is fully encrypted"
	},
	{
		icon: Shield,
		title: "Never Sold",
		description: "Data is never shared or sold"
	},
	{
		icon: HelpCircle,
		title: "Internal Use Only",
		description: "Used only to improve matching"
	}
];

const legalLinks = [
	{
		title: "Terms of Service",
		description: "User agreement and service terms",
		href: "/terms"
	},
	{
		title: "Privacy Policy",
		description: "Data handling and privacy practices",
		href: "/privacy"
	},
	{
		title: "Business Agreement",
		description: "Partnership terms and conditions",
		href: "/business-terms"
	},
	{
		title: "Refund Policy",
		description: "Money-back guarantee details",
		href: "/refund-policy"
	}
];

export function LegalSection() {
	const { t } = useLanguage();
	return (
		<div className="space-y-6">
			<h2 className="text-3xl font-light mb-6">{t.more.legalPrivacy}</h2>
			
			<div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
				<div className="flex flex-col space-y-1.5 p-6 pb-4">
					<div className="mx-auto mb-3 p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full w-12 h-12 flex items-center justify-center">
						<Shield className="h-6 w-6 text-green-700 dark:text-green-400" />
					</div>
					<h3 className="text-lg font-light text-center">{t.more.privacyGuarantees}</h3>
				</div>
				<div className="p-6 pt-0 space-y-3 text-sm">
					{privacyFeatures.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<div key={index} className="flex items-start space-x-3">
								<Icon className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
								<div>
									<div className="font-semibold">{feature.title}</div>
									<div className="text-muted-foreground font-light">{feature.description}</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
				<div className="flex flex-col space-y-1.5 p-6 pb-4">
					<div className="mx-auto mb-3 p-3 bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-900/30 dark:to-stone-900/30 rounded-full w-12 h-12 flex items-center justify-center">
						<FileText className="h-6 w-6 text-amber-700 dark:text-amber-400" />
					</div>
					<h3 className="text-lg font-light text-center">{t.more.legalInformation}</h3>
				</div>
				<div className="p-6 pt-0 space-y-3">
					{legalLinks.map((item, index) => (
						<Link
							key={index}
							href={item.href}
							className="block p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
						>
							<div className="font-semibold text-sm mb-1">{item.title}</div>
							<div className="text-xs text-muted-foreground font-light">{item.description}</div>
						</Link>
					))}
				</div>
			</div>

			<div className="rounded-lg border bg-card border-border/50 bg-gradient-to-br from-muted/25 to-muted/10 backdrop-blur-sm shadow-sm">
				<div className="p-6 text-center">
					<h3 className="font-semibold mb-2">{t.more.legalQuestions}</h3>
					<p className="text-sm text-muted-foreground font-light mb-3">
						{t.more.legalQuestionsText}
					</p>
					<a
						href="mailto:legal@atenra.com"
						className="text-amber-700 dark:text-amber-400 hover:underline text-sm font-medium"
					>
						legal@atenra.com
					</a>
				</div>
			</div>
		</div>
	);
}