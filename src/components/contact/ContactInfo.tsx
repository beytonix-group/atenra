"use client";

import { Mail, Phone, MapPin } from "lucide-react";
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
			<h2 className={`text-3xl font-light mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Contact Directory</h2>

			<div className={`space-y-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
				{/* Contact Directory */}
				<div className="space-y-4">
					<div className="flex items-start gap-3">
						<Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
						<div>
							<h3 className="font-medium text-sm mb-1">General Inquiries</h3>
							<a href="mailto:info@atenra.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								info@atenra.com
							</a>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
						<div>
							<h3 className="font-medium text-sm mb-1">Support & Technical</h3>
							<a href="mailto:it@atenra.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								it@atenra.com
							</a>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
						<div>
							<h3 className="font-medium text-sm mb-1">Media & Partnerships</h3>
							<a href="mailto:contact@atenra.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								contact@atenra.com
							</a>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Mail className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
						<div>
							<h3 className="font-medium text-sm mb-1">Legal & Compliance</h3>
							<a href="mailto:legal@atenra.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
								legal@atenra.com
							</a>
						</div>
					</div>
				</div>

				{/* Office Locations */}
				<div className={`pt-6 border-t transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
					<h3 className="font-medium mb-4">Office Locations</h3>
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
							<div>
								<h4 className="font-medium text-sm mb-1">Florida</h4>
								<p className="text-sm text-muted-foreground">8430 Bird Rd, Miami, FL 33155, USA</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
							<div>
								<h4 className="font-medium text-sm mb-1">U.A.E</h4>
								<p className="text-sm text-muted-foreground">Coming Soon</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}