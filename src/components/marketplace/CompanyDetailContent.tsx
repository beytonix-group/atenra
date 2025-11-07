'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, MapPin, Globe, Phone, Mail, Calendar, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RoleBadge } from '@/components/ui/role-badge';
import { AddEmployeeDialog } from './AddEmployeeDialog';
import { toast } from 'sonner';
import type { CompanyWithCategories, CompanyEmployee } from '@/app/marketplace/actions';

interface CompanyDetailContentProps {
	company: CompanyWithCategories;
	employees: CompanyEmployee[];
	isAdmin: boolean;
}

export function CompanyDetailContent({ company, employees, isAdmin }: CompanyDetailContentProps) {
	const router = useRouter();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [removingEmployeeId, setRemovingEmployeeId] = useState<number | null>(null);

	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const handleRemoveEmployee = async (userId: number, employeeEmail: string) => {
		if (!confirm(`Are you sure you want to remove ${employeeEmail} from this company?`)) {
			return;
		}

		setRemovingEmployeeId(userId);

		try {
			const response = await fetch(`/api/companies/${company.id}/employees`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
			});

			if (!response.ok) {
				const data = await response.json() as { error?: string };
				throw new Error(data.error || 'Failed to remove employee');
			}

			toast.success(`${employeeEmail} has been removed from the company.`);

			router.refresh();
		} catch (error) {
			console.error('Error removing employee:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to remove employee');
		} finally {
			setRemovingEmployeeId(null);
		}
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

			{/* Employees Section */}
			<Card className="mt-6">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Users className="h-5 w-5 text-primary" />
							<CardTitle>Employees</CardTitle>
							<Badge variant="secondary">{employees.length}</Badge>
						</div>
						{isAdmin && (
							<Button onClick={() => setIsDialogOpen(true)} size="sm">
								Add Employee
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{employees.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
							<p>No employees have been added to this company yet.</p>
							{isAdmin && (
								<Button
									onClick={() => setIsDialogOpen(true)}
									variant="outline"
									size="sm"
									className="mt-4"
								>
									Add First Employee
								</Button>
							)}
						</div>
					) : (
						<div className="space-y-4">
							{employees.map((employee) => (
								<div
									key={employee.userId}
									className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
								>
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<h4 className="font-medium">
												{employee.displayName ||
													`${employee.firstName || ''} ${employee.lastName || ''}`.trim() ||
													'Unnamed Employee'}
											</h4>
											<Badge variant="outline" className="capitalize">
												{employee.companyRole}
											</Badge>
											{employee.systemRoleName && (
												<RoleBadge role={employee.systemRoleName} />
											)}
										</div>
										<div className="space-y-1 text-sm text-muted-foreground">
											<div className="flex items-center gap-2">
												<Mail className="h-3 w-3" />
												<span>{employee.email}</span>
											</div>
											{employee.phone && (
												<div className="flex items-center gap-2">
													<Phone className="h-3 w-3" />
													<span>{employee.phone}</span>
												</div>
											)}
											{(employee.city || employee.state) && (
												<div className="flex items-center gap-2">
													<MapPin className="h-3 w-3" />
													<span>
														{[employee.city, employee.state].filter(Boolean).join(', ')}
													</span>
												</div>
											)}
										</div>
									</div>
									{isAdmin && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveEmployee(employee.userId, employee.email)}
											disabled={removingEmployeeId === employee.userId}
											className="text-destructive hover:text-destructive hover:bg-destructive/10"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Employee Dialog */}
			{isAdmin && (
				<AddEmployeeDialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					companyId={company.id}
					onSuccess={() => router.refresh()}
				/>
			)}
		</div>
	);
}