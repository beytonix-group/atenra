"use client";

import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ContactInfo() {
	const { t } = useLanguage();
	
	return (
		<div>
			<h2 className="text-3xl font-light mb-8">{t.contact.info.title}</h2>
			
			<div className="space-y-8">
				{/* Combined Contact Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<div className="flex items-center gap-2 mb-3">
							<Mail className="h-4 w-4 text-muted-foreground" />
							<h3 className="font-medium text-sm">{t.contact.info.email.title}</h3>
						</div>
						<div className="space-y-1 text-sm">
							<p>info@atenra.com</p>
							<p className="text-muted-foreground">support@atenra.com</p>
						</div>
					</div>
					
					<div>
						<div className="flex items-center gap-2 mb-3">
							<Phone className="h-4 w-4 text-muted-foreground" />
							<h3 className="font-medium text-sm">{t.contact.info.phone.title}</h3>
						</div>
						<p className="text-sm">+1 (555) 123-4567</p>
						<p className="text-xs text-muted-foreground mt-1">{t.contact.info.phone.description}</p>
					</div>
					
					<div>
						<div className="flex items-center gap-2 mb-3">
							<MapPin className="h-4 w-4 text-muted-foreground" />
							<h3 className="font-medium text-sm">{t.contact.info.location.title}</h3>
						</div>
						<p className="text-sm">San Francisco, CA</p>
						<p className="text-xs text-muted-foreground mt-1">Remote-first company</p>
					</div>
				</div>

				{/* Response Time */}
				<div className="pt-6 border-t">
					<div className="flex items-center gap-2 mb-3">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<h3 className="font-medium text-sm">{t.contact.info.response.title}</h3>
					</div>
					<div className="grid grid-cols-3 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">General:</span> 24 hours
						</div>
						<div>
							<span className="text-muted-foreground">Support:</span> 12 hours
						</div>
						<div>
							<span className="text-muted-foreground">Urgent:</span> 2 hours
						</div>
					</div>
				</div>
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