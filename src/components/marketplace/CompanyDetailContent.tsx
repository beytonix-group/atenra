'use client';

import Link from 'next/link';
import { ArrowLeft, Building2, MapPin, Globe, Phone, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CompanyWithCategories } from '@/app/marketplace/actions';

interface CompanyDetailContentProps {
	company: CompanyWithCategories;
}

export function CompanyDetailContent({ company }: CompanyDetailContentProps) {
	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<div className="container mx-auto px-4 py-6 max-w-5xl">
			{/* Back Button */}
			<Button variant="ghost" asChild className="mb-6">
				<Link href="/marketplace">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Marketplace
				</Link>
			</Button>

			{/* Single Consolidated Card */}
			<Card>
				<CardHeader className="pb-6">
					<div className="flex items-start gap-6">
						{/* Logo Placeholder */}
						<div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
							<Building2 className="h-10 w-10 text-primary" />
						</div>

						{/* Company Header Info */}
						<div className="flex-1">
							<div className="mb-3">
								<h1 className="text-3xl font-bold mb-2">{company.name}</h1>
								{(company.city || company.state) && (
									<div className="flex items-center gap-2 text-muted-foreground">
										<MapPin className="h-4 w-4" />
										<span>
											{[company.city, company.state, company.country].filter(Boolean).join(', ')}
										</span>
									</div>
								)}
							</div>

							{/* Description */}
							{company.description && (
								<p className="text-muted-foreground mb-4">{company.description}</p>
							)}

							{/* Services as Badge Tokens */}
							{company.categories.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{company.categories.map((category) => (
										<Badge
											key={category.id}
											variant="secondary"
											className="text-sm"
										>
											{category.name}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>
				</CardHeader>

				<Separator />

				<CardContent className="pt-6">
					<div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
						{/* Left Column - Address */}
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Address</h3>
							<div className="space-y-1 text-sm">
								{company.addressLine1 && <p>{company.addressLine1}</p>}
								{company.addressLine2 && <p>{company.addressLine2}</p>}
								{(company.city || company.state || company.zipCode) && (
									<p>
										{[company.city, company.state, company.zipCode]
											.filter(Boolean)
											.join(', ')}
									</p>
								)}
								{company.country && <p>{company.country}</p>}
								{!company.addressLine1 && !company.city && (
									<p className="text-muted-foreground italic">No address information available</p>
								)}
							</div>
						</div>

						{/* Right Column - Contact Information */}
						<div>
							<h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Contact</h3>
							<div className="space-y-3 text-sm">
								{company.email && (
									<div className="flex items-center gap-3">
										<Mail className="h-4 w-4 text-muted-foreground" />
										<a
											href={`mailto:${company.email}`}
											className="hover:underline text-primary"
										>
											{company.email}
										</a>
									</div>
								)}

								{company.phone && (
									<div className="flex items-center gap-3">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<a
											href={`tel:${company.phone}`}
											className="hover:underline text-primary"
										>
											{company.phone}
										</a>
									</div>
								)}

								{company.websiteUrl && (
									<div className="flex items-center gap-3">
										<Globe className="h-4 w-4 text-muted-foreground" />
										<a
											href={company.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="hover:underline text-primary"
										>
											{company.websiteUrl.replace(/^https?:\/\//, '')}
										</a>
									</div>
								)}

								{(!company.email && !company.phone && !company.websiteUrl) && (
									<p className="text-muted-foreground italic">No contact information available</p>
								)}
							</div>
						</div>
					</div>

					{/* Member Since - Footer */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground mt-6 pt-4 border-t">
						<Calendar className="h-4 w-4" />
						<span>Member since {formatDate(company.createdAt)}</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}