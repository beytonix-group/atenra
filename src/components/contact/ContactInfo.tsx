"use client";

import { Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect, useRef, useState } from "react";

export function ContactInfo() {
	const { nt } = useLanguage();
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
			<h2 className={`text-3xl font-light mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
				{nt.contact.directory.title}
			</h2>

			<div className={`space-y-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
				{/* Contact Directory */}
				<div className="space-y-4">
					<div className="flex items-start gap-3">
						<Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
						<div>
							<h3 className="font-medium text-sm mb-1">{nt.contact.directory.generalInquiries.label}</h3>
							<a href={`mailto:${nt.contact.directory.generalInquiries.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								{nt.contact.directory.generalInquiries.email}
							</a>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
						<div>
							<h3 className="font-medium text-sm mb-1">{nt.contact.directory.supportTechnical.label}</h3>
							<a href={`mailto:${nt.contact.directory.supportTechnical.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								{nt.contact.directory.supportTechnical.email}
							</a>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
						<div>
							<h3 className="font-medium text-sm mb-1">{nt.contact.directory.mediaPartnerships.label}</h3>
							<a href={`mailto:${nt.contact.directory.mediaPartnerships.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								{nt.contact.directory.mediaPartnerships.email}
							</a>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
						<div>
							<h3 className="font-medium text-sm mb-1">{nt.contact.directory.legalCompliance.label}</h3>
							<a href={`mailto:${nt.contact.directory.legalCompliance.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								{nt.contact.directory.legalCompliance.email}
							</a>
						</div>
					</div>
				</div>

				{/* Office Locations */}
				<div className={`pt-6 border-t transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h3 className="font-medium mb-4">{nt.contact.offices.title}</h3>
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
							<div>
								<h4 className="font-medium text-sm mb-1">{nt.contact.offices.florida.label}</h4>
								<p className="text-sm text-muted-foreground">{nt.contact.offices.florida.address}</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
							<div>
								<h4 className="font-medium text-sm mb-1">{nt.contact.offices.uae.label}</h4>
								<p className="text-sm text-muted-foreground">{nt.contact.offices.uae.address}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
