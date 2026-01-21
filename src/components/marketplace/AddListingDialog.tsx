'use client';

import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddListingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	companyId: number;
	onSuccess?: () => void;
}

interface FormData {
	title: string;
	description: string;
	price: string;
}

export function AddListingDialog({
	open,
	onOpenChange,
	companyId,
	onSuccess,
}: AddListingDialogProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState<FormData>({
		title: '',
		description: '',
		price: '',
	});

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) {
			toast.error('Title is required.');
			return;
		}

		if (formData.title.length > 200) {
			toast.error('Title must be 200 characters or less.');
			return;
		}

		if (formData.description.length > 2000) {
			toast.error('Description must be 2000 characters or less.');
			return;
		}

		setIsSubmitting(true);

		try {
			const priceValue = formData.price.trim() === '' ? null : parseFloat(formData.price);

			if (priceValue !== null && (isNaN(priceValue) || priceValue < 0)) {
				toast.error('Please enter a valid price or leave empty for "Contact for price".');
				setIsSubmitting(false);
				return;
			}

			const response = await fetch(`/api/company/${companyId}/listings`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title.trim(),
					description: formData.description.trim() || null,
					price: priceValue,
				}),
			});

			const data = await response.json() as { success?: boolean; error?: string };

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create listing');
			}

			toast.success('Listing created successfully.');

			// Reset form
			setFormData({
				title: '',
				description: '',
				price: '',
			});

			onOpenChange(false);

			// Call success callback and refresh
			if (onSuccess) {
				onSuccess();
			}
			router.refresh();
		} catch (error) {
			console.error('Error creating listing:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to create listing');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Add Listing</DialogTitle>
					<DialogDescription>
						Add a new service or product listing for this company.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Title Field */}
					<div className="space-y-2">
						<Label htmlFor="title">
							Title <span className="text-red-500">*</span>
						</Label>
						<Input
							id="title"
							value={formData.title}
							onChange={(e) => handleInputChange('title', e.target.value)}
							required
							placeholder="e.g., Home Inspection Service"
							maxLength={200}
						/>
						<p className="text-xs text-muted-foreground">
							{formData.title.length}/200 characters
						</p>
					</div>

					{/* Description Field */}
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => handleInputChange('description', e.target.value)}
							placeholder="Describe your service or product..."
							rows={4}
							maxLength={2000}
						/>
						<p className="text-xs text-muted-foreground">
							{formData.description.length}/2000 characters
						</p>
					</div>

					{/* Price Field */}
					<div className="space-y-2">
						<Label htmlFor="price">Price</Label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
								$
							</span>
							<Input
								id="price"
								type="number"
								step="0.01"
								min="0"
								value={formData.price}
								onChange={(e) => handleInputChange('price', e.target.value)}
								placeholder="0.00"
								className="pl-7"
							/>
						</div>
						<p className="text-xs text-muted-foreground">
							Leave empty for &quot;Contact for price&quot;
						</p>
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
								'Add Listing'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
