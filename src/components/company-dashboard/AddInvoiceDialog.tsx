'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddInvoiceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	companyId: number;
	onSuccess?: () => void;
}

interface LineItem {
	id: string;
	description: string;
	quantity: number;
	unitPrice: string;
}

interface FormData {
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	invoiceNumber: string;
	invoiceDate: string;
	dueDate: string;
	taxRate: string;
	discount: string;
	description: string;
	notes: string;
	terms: string;
	status: 'draft' | 'sent';
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialFormData: FormData = {
	customerName: '',
	customerEmail: '',
	customerPhone: '',
	invoiceNumber: '',
	invoiceDate: new Date().toISOString().split('T')[0],
	dueDate: '',
	taxRate: '0',
	discount: '0',
	description: '',
	notes: '',
	terms: '',
	status: 'draft',
};

const initialLineItem = (): LineItem => ({
	id: generateId(),
	description: '',
	quantity: 1,
	unitPrice: '',
});

export function AddInvoiceDialog({
	open,
	onOpenChange,
	companyId,
	onSuccess,
}: AddInvoiceDialogProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [lineItems, setLineItems] = useState<LineItem[]>([initialLineItem()]);

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			setFormData(initialFormData);
			setLineItems([initialLineItem()]);
		}
	}, [open]);

	// Calculate totals
	const calculations = useMemo(() => {
		const subtotalCents = lineItems.reduce((sum, item) => {
			const price = parseFloat(item.unitPrice) || 0;
			return sum + Math.round(price * item.quantity * 100);
		}, 0);

		const taxRateBps = Math.round((parseFloat(formData.taxRate) || 0) * 100);
		const taxAmountCents = Math.round(subtotalCents * taxRateBps / 10000);
		const discountCents = Math.round((parseFloat(formData.discount) || 0) * 100);
		const totalCents = subtotalCents + taxAmountCents - discountCents;

		return {
			subtotalCents,
			taxRateBps,
			taxAmountCents,
			discountCents,
			totalCents,
		};
	}, [lineItems, formData.taxRate, formData.discount]);

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
		setLineItems(prev =>
			prev.map(item =>
				item.id === id ? { ...item, [field]: value } : item
			)
		);
	};

	const addLineItem = () => {
		setLineItems(prev => [...prev, initialLineItem()]);
	};

	const removeLineItem = (id: string) => {
		if (lineItems.length > 1) {
			setLineItems(prev => prev.filter(item => item.id !== id));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.customerName.trim() || !formData.invoiceDate) {
			toast.error('Please fill in all required fields');
			return;
		}

		const validLineItems = lineItems.filter(item =>
			item.description.trim() && parseFloat(item.unitPrice) > 0 && item.quantity > 0
		);

		if (validLineItems.length === 0) {
			toast.error('Please add at least one line item with description and price');
			return;
		}

		if (formData.dueDate && formData.dueDate < formData.invoiceDate) {
			toast.error('Due date must be on or after the invoice date');
			return;
		}

		// Recalculate totals from valid items only to ensure consistency
		const subtotalCents = validLineItems.reduce((sum, item) => {
			const price = parseFloat(item.unitPrice) || 0;
			return sum + Math.round(price * item.quantity * 100);
		}, 0);
		const taxRateBps = Math.round((parseFloat(formData.taxRate) || 0) * 100);
		const taxAmountCents = Math.round(subtotalCents * taxRateBps / 10000);
		const discountCents = Math.round((parseFloat(formData.discount) || 0) * 100);
		const totalCents = subtotalCents + taxAmountCents - discountCents;

		setIsSubmitting(true);

		try {
			const invoiceDate = Math.floor(new Date(formData.invoiceDate).getTime() / 1000);
			const dueDate = formData.dueDate
				? Math.floor(new Date(formData.dueDate).getTime() / 1000)
				: undefined;

			const response = await fetch(`/api/company/${companyId}/invoices`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					customerName: formData.customerName.trim(),
					customerEmail: formData.customerEmail.trim() || undefined,
					customerPhone: formData.customerPhone.trim() || undefined,
					invoiceNumber: formData.invoiceNumber.trim() || undefined, // Auto-generated if empty
					invoiceDate,
					dueDate,
					subtotalCents,
					taxRateBps,
					taxAmountCents,
					discountCents,
					totalCents,
					status: formData.status,
					description: formData.description.trim() || undefined,
					notes: formData.notes.trim() || undefined,
					terms: formData.terms.trim() || undefined,
					lineItems: validLineItems.map((item, index) => ({
						description: item.description.trim(),
						quantity: item.quantity,
						unitPriceCents: Math.round(parseFloat(item.unitPrice) * 100),
						totalCents: Math.round(parseFloat(item.unitPrice) * item.quantity * 100),
						sortOrder: index,
					})),
				}),
			});

			if (!response.ok) {
				let errorMessage = 'Failed to create invoice';
				try {
					const data = await response.json() as { error?: string };
					errorMessage = data.error || errorMessage;
				} catch {
					// Response body is not valid JSON
				}
				throw new Error(errorMessage);
			}

			const result = await response.json() as { invoice?: { invoiceNumber?: string } };
			const invoiceNum = result.invoice?.invoiceNumber || formData.invoiceNumber || 'New invoice';
			toast.success(`Invoice ${invoiceNum} created successfully`);
			setFormData(initialFormData);
			setLineItems([initialLineItem()]);
			onOpenChange(false);
			onSuccess?.();
			router.refresh();
		} catch (error) {
			console.error('Error creating invoice:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to create invoice');
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatCurrency = (cents: number): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(cents / 100);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Invoice</DialogTitle>
					<DialogDescription>
						Create a new invoice for a customer. Line items are required.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
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

						{/* Invoice Info */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="invoiceNumber">
									Invoice Number <span className="text-muted-foreground text-xs">(optional)</span>
								</Label>
								<Input
									id="invoiceNumber"
									value={formData.invoiceNumber}
									onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
									placeholder="Auto-generated"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value) => handleInputChange('status', value as 'draft' | 'sent')}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="draft">Draft</SelectItem>
										<SelectItem value="sent">Sent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="invoiceDate">
									Invoice Date <span className="text-red-500">*</span>
								</Label>
								<Input
									id="invoiceDate"
									type="date"
									value={formData.invoiceDate}
									onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="dueDate">Due Date</Label>
								<Input
									id="dueDate"
									type="date"
									value={formData.dueDate}
									onChange={(e) => handleInputChange('dueDate', e.target.value)}
								/>
							</div>
						</div>

						{/* Line Items */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label className="text-base font-medium">
									Line Items <span className="text-red-500">*</span>
								</Label>
								<Button type="button" variant="outline" size="sm" onClick={addLineItem}>
									<Plus className="h-4 w-4 mr-1" />
									Add Item
								</Button>
							</div>

							<div className="border rounded-lg overflow-hidden">
								<table className="w-full">
									<thead className="bg-muted">
										<tr>
											<th className="text-left text-sm font-medium px-3 py-2">Description</th>
											<th className="text-left text-sm font-medium px-3 py-2 w-20">Qty</th>
											<th className="text-left text-sm font-medium px-3 py-2 w-28">Unit Price</th>
											<th className="text-right text-sm font-medium px-3 py-2 w-24">Total</th>
											<th className="w-10"></th>
										</tr>
									</thead>
									<tbody>
										{lineItems.map((item) => {
											const total = (parseFloat(item.unitPrice) || 0) * item.quantity;
											return (
												<tr key={item.id} className="border-t">
													<td className="px-2 py-2">
														<Input
															value={item.description}
															onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
															placeholder="Item description"
															className="h-8"
														/>
													</td>
													<td className="px-2 py-2">
														<Input
															type="number"
															min="1"
															value={item.quantity}
															onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
															className="h-8"
														/>
													</td>
													<td className="px-2 py-2">
														<div className="relative">
															<span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
															<Input
																type="number"
																step="0.01"
																min="0"
																value={item.unitPrice}
																onChange={(e) => handleLineItemChange(item.id, 'unitPrice', e.target.value)}
																placeholder="0.00"
																className="h-8 pl-6"
															/>
														</div>
													</td>
													<td className="px-3 py-2 text-right text-sm font-medium">
														{formatCurrency(Math.round(total * 100))}
													</td>
													<td className="px-2 py-2">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => removeLineItem(item.id)}
															disabled={lineItems.length === 1}
															className="h-8 w-8 p-0"
														>
															<Trash2 className="h-4 w-4 text-muted-foreground" />
														</Button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>

						{/* Tax, Discount, and Totals */}
						<div className="flex justify-end">
							<div className="w-72 space-y-3">
								<div className="flex items-center justify-between gap-4">
									<Label htmlFor="taxRate" className="text-sm">Tax Rate (%)</Label>
									<Input
										id="taxRate"
										type="number"
										step="0.01"
										min="0"
										max="100"
										value={formData.taxRate}
										onChange={(e) => handleInputChange('taxRate', e.target.value)}
										className="w-24 h-8"
									/>
								</div>

								<div className="flex items-center justify-between gap-4">
									<Label htmlFor="discount" className="text-sm">Discount ($)</Label>
									<Input
										id="discount"
										type="number"
										step="0.01"
										min="0"
										value={formData.discount}
										onChange={(e) => handleInputChange('discount', e.target.value)}
										className="w-24 h-8"
									/>
								</div>

								<div className="border-t pt-3 space-y-2">
									<div className="flex justify-between text-sm">
										<span>Subtotal</span>
										<span>{formatCurrency(calculations.subtotalCents)}</span>
									</div>
									<div className="flex justify-between text-sm">
										<span>Tax ({formData.taxRate || 0}%)</span>
										<span>{formatCurrency(calculations.taxAmountCents)}</span>
									</div>
									{calculations.discountCents > 0 && (
										<div className="flex justify-between text-sm text-green-600">
											<span>Discount</span>
											<span>-{formatCurrency(calculations.discountCents)}</span>
										</div>
									)}
									<div className="flex justify-between font-semibold text-lg border-t pt-2">
										<span>Total</span>
										<span>{formatCurrency(calculations.totalCents)}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Optional Fields */}
						<div className="space-y-4 border-t pt-4">
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									value={formData.description}
									onChange={(e) => handleInputChange('description', e.target.value)}
									placeholder="Brief description of the invoice"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="notes">Notes</Label>
									<Textarea
										id="notes"
										value={formData.notes}
										onChange={(e) => handleInputChange('notes', e.target.value)}
										placeholder="Notes visible to customer..."
										rows={2}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="terms">Terms & Conditions</Label>
									<Textarea
										id="terms"
										value={formData.terms}
										onChange={(e) => handleInputChange('terms', e.target.value)}
										placeholder="Payment terms..."
										rows={2}
									/>
								</div>
							</div>
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
									'Create Invoice'
								)}
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
