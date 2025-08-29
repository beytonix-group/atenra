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
		<section className="py-20 md:py-32 bg-muted/20">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-light mb-6">{t.about.supportedServices}</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{services.map((service, index) => {
						const Icon = service.icon;
						return (
							<div key={index} className="group">
								<div className="flex items-start space-x-4 p-6 rounded-2xl bg-card border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
									<div className="flex-shrink-0">
										<div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
											<Icon className="h-6 w-6 text-orange-600" />
										</div>
									</div>
									<div className="flex-grow">
										<h3 className="text-xl font-semibold mb-2">{service.title}</h3>
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