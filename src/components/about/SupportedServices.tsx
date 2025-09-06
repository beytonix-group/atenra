"use client";

import { Home, Truck, Heart, Car, Briefcase, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SupportedServices() {
	const { t } = useLanguage();
	
	const services = [
		{
			icon: Home,
			title: t.about.services.home.title,
			description: t.about.services.home.description
		},
		{
			icon: Truck,
			title: t.about.services.logistics.title,
			description: t.about.services.logistics.description
		},
		{
			icon: Heart,
			title: t.about.services.wellness.title,
			description: t.about.services.wellness.description
		},
		{
			icon: Car,
			title: t.about.services.vehicle.title,
			description: t.about.services.vehicle.description
		},
		{
			icon: Briefcase,
			title: t.about.services.professional.title,
			description: t.about.services.professional.description
		},
		{
			icon: MoreHorizontal,
			title: t.about.services.more.title,
			description: t.about.services.more.description
		}
	];
	return (
		<section className="py-12 md:py-16 bg-muted/10">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-20">
					<h2 className="text-4xl md:text-5xl font-light">{t.about.supportedServices}</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
					{services.map((service, index) => {
						const Icon = service.icon;
						return (
							<div key={index} className="flex flex-col">
								<div className="flex items-start gap-4 mb-3">
									<Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div className="flex-grow">
										<h3 className="text-lg font-medium mb-2">{service.title}</h3>
										<p className="text-muted-foreground text-sm leading-relaxed">
											{service.description}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}