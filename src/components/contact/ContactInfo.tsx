"use client";

import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ContactInfo() {
	const { t } = useLanguage();
	
	const contactMethods = [
		{
			icon: Mail,
			title: t.contact.info.email.title,
			details: ["General: info@atenra.com", "Support: support@atenra.com", "Media: media@atenra.com"],
			description: t.contact.info.email.description
		},
		{
			icon: Phone,
			title: t.contact.info.phone.title,
			details: ["+1 (555) 123-4567"],
			description: t.contact.info.phone.description
		},
		{
			icon: MapPin,
			title: t.contact.info.location.title,
			details: ["San Francisco, CA", "Remote-first company"],
			description: t.contact.info.location.description
		},
		{
			icon: Clock,
			title: t.contact.info.response.title,
			details: ["General: 24 hours", "Support: 12 hours", "Urgent: 2 hours"],
			description: t.contact.info.response.description
		}
	];
	return (
		<div>
			<h2 className="text-3xl font-light mb-8">{t.contact.info.title}</h2>
			
			<div className="space-y-6">
				{contactMethods.map((method, index) => {
					const Icon = method.icon;
					return (
						<div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
							<div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
								<Icon className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-grow">
								<h3 className="font-semibold mb-1">{method.title}</h3>
								<div className="space-y-1">
									{method.details.map((detail, i) => (
										<p key={i} className="text-sm text-foreground">
											{detail}
										</p>
									))}
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									{method.description}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl border">
				<div className="flex items-center space-x-3 mb-3">
					<MessageSquare className="h-5 w-5 text-blue-600" />
					<h3 className="font-semibold">{t.contact.info.community.title}</h3>
				</div>
				<p className="text-sm text-muted-foreground mb-4">
					{t.contact.info.community.description}
				</p>
				<a
					href="/social"
					className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
				>
					{t.contact.info.community.link}
				</a>
			</div>
		</div>
	);
}