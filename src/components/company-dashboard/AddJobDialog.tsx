'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddJobDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	companyId: number;
	onSuccess?: () => void;
}

interface Category {
	id: number;
	name: string;
	description: string | null;
}

interface FormData {
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	categoryId: string;
	description: string;
	status: 'active' | 'completed' | 'cancelled';
	priority: 'low' | 'medium' | 'high' | 'urgent';
	startDate: string;
	endDate: string;
	notes: string;
	budget: string;
	jobAddressLine1: string;
	jobAddressLine2: string;
	jobCity: string;
	jobState: string;
	jobZip: string;
}

const initialFormData: FormData = {
	customerName: '',
	customerEmail: '',
	customerPhone: '',
	categoryId: '',
	description: '',
	status: 'active',
	priority: 'medium',
	startDate: '',
	endDate: '',
	notes: '',
	budget: '',
	jobAddressLine1: '',
	jobAddressLine2: '',
	jobCity: '',
	jobState: '',
	jobZip: '',
};

export function AddJobDialog({
	open,
	onOpenChange,
	companyId,
	onSuccess,
}: AddJobDialogProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [formData, setFormData] = useState<FormData>(initialFormData);

	// Load categories when dialog opens
	useEffect(() => {
		if (open) {
			setIsLoading(true);
			fetch(`/api/company/${companyId}/categories`)
				.then(r => r.json() as Promise<{ categories?: Category[] }>)
				.then((data) => {
					setCategories(data.categories || []);
				})
				.catch(error => {
					console.error('Error loading data:', error);
					toast.error('Failed to load form data');
				})
				.finally(() => setIsLoading(false));
		}
	}, [open, companyId]);

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.customerName.trim() || !formData.categoryId || !formData.description.trim()) {
			toast.error('Please fill in all required fields');
			return;
		}

		setIsSubmitting(true);

		try {
			// Convert budget to cents
			const parsedBudget = parseFloat(formData.budget);
			const budgetCents = !isNaN(parsedBudget)
				? Math.round(parsedBudget * 100)
				: undefined;

			// Convert dates to timestamps
			const startDate = formData.startDate
				? Math.floor(new Date(formData.startDate).getTime() / 1000)
				: undefined;
			const endDate = formData.endDate
				? Math.floor(new Date(formData.endDate).getTime() / 1000)
				: undefined;

			const response = await fetch(`/api/company/${companyId}/jobs`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					customerName: formData.customerName.trim(),
					customerEmail: formData.customerEmail.trim() || undefined,
					customerPhone: formData.customerPhone.trim() || undefined,
					categoryId: parseInt(formData.categoryId),
					description: formData.description.trim(),
					status: formData.status,
					priority: formData.priority,
					startDate,
					endDate,
					notes: formData.notes.trim() || undefined,
					budgetCents,
					jobAddressLine1: formData.jobAddressLine1.trim() || undefined,
					jobAddressLine2: formData.jobAddressLine2.trim() || undefined,
					jobCity: formData.jobCity.trim() || undefined,
					jobState: formData.jobState.trim() || undefined,
					jobZip: formData.jobZip.trim() || undefined,
				}),
			});

			const data = await response.json() as { error?: string };

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create job');
			}

			toast.success('Job created successfully');
			setFormData(initialFormData);
			onOpenChange(false);
			onSuccess?.();
			router.refresh();
		} catch (error) {
			console.error('Error creating job:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to create job');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add New Job</DialogTitle>
					<DialogDescription>
						Create a new job for a customer. Fill in the required details below.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Customer Info */}
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="customerName">
									Customer Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="customerName"
									value={formData.customerName}
									onChange={(e) => handleInputChange('customerName', e.target.value)}
									placeholder="John Doe"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="customerEmail">Email</Label>
								<Input
									id="customerEmail"
									type="email"
									value={formData.customerEmail}
									onChange={(e) => handleInputChange('customerEmail', e.target.value)}
									placeholder="john@example.com"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="customerPhone">Phone</Label>
								<Input
									id="customerPhone"
									value={formData.customerPhone}
									onChange={(e) => handleInputChange('customerPhone', e.target.value)}
									placeholder="(555) 123-4567"
								/>
							</div>
						</div>

						{/* Category Selection */}
						<div className="space-y-2">
							<Label htmlFor="categoryId">
								Service Category <span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.categoryId}
								onValueChange={(value) => handleInputChange('categoryId', value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{categories.length === 0 ? (
										<SelectItem value="" disabled>
											No categories available
										</SelectItem>
									) : (
										categories.map((category) => (
											<SelectItem key={category.id} value={category.id.toString()}>
												{category.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="description">
								Description <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) => handleInputChange('description', e.target.value)}
								placeholder="Describe the job..."
								rows={3}
							/>
						</div>

						{/* Status and Priority */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value) => handleInputChange('status', value as FormData['status'])}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="priority">Priority</Label>
								<Select
									value={formData.priority}
									onValueChange={(value) => handleInputChange('priority', value as FormData['priority'])}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Dates */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="startDate">Start Date</Label>
								<Input
									id="startDate"
									type="date"
									value={formData.startDate}
									onChange={(e) => handleInputChange('startDate', e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endDate">End Date</Label>
								<Input
									id="endDate"
									type="date"
									value={formData.endDate}
									onChange={(e) => handleInputChange('endDate', e.target.value)}
								/>
							</div>
						</div>

						{/* Budget */}
						<div className="space-y-2">
							<Label htmlFor="budget">Budget ($)</Label>
							<Input
								id="budget"
								type="number"
								step="0.01"
								min="0"
								value={formData.budget}
								onChange={(e) => handleInputChange('budget', e.target.value)}
								placeholder="0.00"
							/>
						</div>

						{/* Job Address */}
						<div className="space-y-4">
							<Label className="text-base font-medium">Job Location</Label>

							<div className="space-y-2">
								<Label htmlFor="jobAddressLine1">Address Line 1</Label>
								<Input
									id="jobAddressLine1"
									value={formData.jobAddressLine1}
									onChange={(e) => handleInputChange('jobAddressLine1', e.target.value)}
									placeholder="123 Main St"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="jobAddressLine2">Address Line 2</Label>
								<Input
									id="jobAddressLine2"
									value={formData.jobAddressLine2}
									onChange={(e) => handleInputChange('jobAddressLine2', e.target.value)}
									placeholder="Apt 4B"
								/>
							</div>

							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="jobCity">City</Label>
									<Input
										id="jobCity"
										value={formData.jobCity}
										onChange={(e) => handleInputChange('jobCity', e.target.value)}
										placeholder="New York"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="jobState">State</Label>
									<Input
										id="jobState"
										value={formData.jobState}
										onChange={(e) => handleInputChange('jobState', e.target.value)}
										placeholder="NY"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="jobZip">ZIP Code</Label>
									<Input
										id="jobZip"
										value={formData.jobZip}
										onChange={(e) => handleInputChange('jobZip', e.target.value)}
										placeholder="10001"
									/>
								</div>
							</div>
						</div>

						{/* Notes */}
						<div className="space-y-2">
							<Label htmlFor="notes">Notes</Label>
							<Textarea
								id="notes"
								value={formData.notes}
								onChange={(e) => handleInputChange('notes', e.target.value)}
								placeholder="Additional notes..."
								rows={2}
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									'Create Job'
								)}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
