"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect, useRef, useState } from "react";

export function ContactInfo() {
	const { t } = useLanguage();
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
	
	return (
		<div ref={sectionRef}>
			<h2 className={`text-3xl font-light mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>{t.contact.info.title}</h2>

			<div className={`space-y-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
			</div>
		</div>
	);
}