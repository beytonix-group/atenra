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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddEmployeeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	companyId: number;
	onSuccess?: () => void;
}

interface FormData {
	email: string;
	firstName: string;
	lastName: string;
	displayName: string;
	phone: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	companyRole: 'owner' | 'manager' | 'staff' | '';
}

export function AddEmployeeDialog({
	open,
	onOpenChange,
	companyId,
	onSuccess,
}: AddEmployeeDialogProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [emailCheckLoading, setEmailCheckLoading] = useState(false);
	const [emailExists, setEmailExists] = useState(false);
	const [existingUser, setExistingUser] = useState<any>(null);

	const [formData, setFormData] = useState<FormData>({
		email: '',
		firstName: '',
		lastName: '',
		displayName: '',
		phone: '',
		addressLine1: '',
		addressLine2: '',
		city: '',
		state: '',
		zipCode: '',
		country: 'US',
		companyRole: 'staff',
	});

	// Debounced email check
	useEffect(() => {
		if (!formData.email || formData.email.length < 3) {
			setEmailExists(false);
			setExistingUser(null);
			return;
		}

		// Simple email regex
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			return;
		}

		const timer = setTimeout(async () => {
			setEmailCheckLoading(true);
			try {
				const response = await fetch('/api/admin/users/check-email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email: formData.email, companyId }),
				});

				if (response.ok) {
					const data = await response.json() as { exists: boolean; user?: any };
					setEmailExists(data.exists);
					setExistingUser(data.user || null);

					// Pre-populate form fields with existing user data
					if (data.exists && data.user) {
						setFormData(prev => ({
							...prev,
							firstName: data.user.firstName || '',
							lastName: data.user.lastName || '',
							displayName: data.user.displayName || '',
							phone: data.user.phone || '',
							addressLine1: data.user.addressLine1 || '',
							addressLine2: data.user.addressLine2 || '',
							city: data.user.city || '',
							state: data.user.state || '',
							zipCode: data.user.zipCode || '',
							country: data.user.country || 'US',
						}));
					}
				}
			} catch (error) {
				console.error('Error checking email:', error);
			} finally {
				setEmailCheckLoading(false);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [formData.email, companyId]);

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.email || !formData.companyRole) {
			toast.error('Email and Company Role are required fields.');
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch(`/api/companies/${companyId}/employees`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: formData.email,
					firstName: formData.firstName || undefined,
					lastName: formData.lastName || undefined,
					displayName: formData.displayName || undefined,
					phone: formData.phone || undefined,
					addressLine1: formData.addressLine1 || undefined,
					addressLine2: formData.addressLine2 || undefined,
					city: formData.city || undefined,
					state: formData.state || undefined,
					zipCode: formData.zipCode || undefined,
					country: formData.country || 'US',
					companyRole: formData.companyRole,
					isExistingUser: emailExists,
				}),
			});

			const data = await response.json() as { success?: boolean; emailSent?: boolean; isExistingUser?: boolean; error?: string };

			if (!response.ok) {
				throw new Error(data.error || 'Failed to create employee');
			}

			if (data.isExistingUser) {
				toast.success(`${formData.email} has been added to the company as ${formData.companyRole}.`);
			} else if (data.emailSent) {
				toast.success(`Invitation sent to ${formData.email}. They will receive an email with instructions to set up their account.`);
			} else {
				toast.success(`Employee added: ${formData.email}. Warning: Invitation email failed to send.`, {
					description: 'You can resend the invitation from the Pending Invitations section.',
				});
			}

			// Reset form
			setFormData({
				email: '',
				firstName: '',
				lastName: '',
				displayName: '',
				phone: '',
				addressLine1: '',
				addressLine2: '',
				city: '',
				state: '',
				zipCode: '',
				country: 'US',
				companyRole: 'staff',
			});

			onOpenChange(false);

			// Call success callback and refresh
			if (onSuccess) {
				onSuccess();
			}
			router.refresh();
		} catch (error) {
			console.error('Error creating employee:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to create employee');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add Employee</DialogTitle>
					<DialogDescription>
						Create a new employee account and associate it with this company.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Email Field */}
					<div className="space-y-2">
						<Label htmlFor="email">
							Email Address <span className="text-red-500">*</span>
						</Label>
						<div className="relative">
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange('email', e.target.value)}
								required
								placeholder="employee@example.com"
							/>
							{emailCheckLoading && (
								<div className="absolute right-3 top-3">
									<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
								</div>
							)}
						</div>
						{emailExists && existingUser && (
							<div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
								<AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
								<div className="text-sm">
									<p className="font-medium text-blue-800">Existing User Account</p>
									<p className="text-blue-700">
										This email belongs to: {existingUser.displayName || `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim() || existingUser.email}
									</p>
									<p className="text-blue-600 text-xs mt-1">
										Their profile information is shown below. Select a company role to add them.
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Name Fields */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input
								id="firstName"
								value={formData.firstName}
								onChange={(e) => handleInputChange('firstName', e.target.value)}
								placeholder="John"
								maxLength={30}
								disabled={emailExists}
								className={emailExists ? 'bg-muted' : ''}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								id="lastName"
								value={formData.lastName}
								onChange={(e) => handleInputChange('lastName', e.target.value)}
								placeholder="Doe"
								maxLength={30}
								disabled={emailExists}
								className={emailExists ? 'bg-muted' : ''}
							/>
						</div>
					</div>

					{/* Display Name */}
					<div className="space-y-2">
						<Label htmlFor="displayName">Display Name</Label>
						<Input
							id="displayName"
							value={formData.displayName}
							onChange={(e) => handleInputChange('displayName', e.target.value)}
							placeholder="John D."
							maxLength={65}
							disabled={emailExists}
							className={emailExists ? 'bg-muted' : ''}
						/>
					</div>

					{/* Phone */}
					<div className="space-y-2">
						<Label htmlFor="phone">Phone</Label>
						<Input
							id="phone"
							type="tel"
							value={formData.phone}
							onChange={(e) => handleInputChange('phone', e.target.value)}
							placeholder="(555) 123-4567"
							maxLength={14}
							disabled={emailExists}
							className={emailExists ? 'bg-muted' : ''}
						/>
					</div>

					{/* Address Fields */}
					<div className="space-y-2">
						<Label htmlFor="addressLine1">Address Line 1</Label>
						<Input
							id="addressLine1"
							value={formData.addressLine1}
							onChange={(e) => handleInputChange('addressLine1', e.target.value)}
							placeholder="123 Main St"
							maxLength={50}
							disabled={emailExists}
							className={emailExists ? 'bg-muted' : ''}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="addressLine2">Address Line 2</Label>
						<Input
							id="addressLine2"
							value={formData.addressLine2}
							onChange={(e) => handleInputChange('addressLine2', e.target.value)}
							placeholder="Apt 4B"
							maxLength={50}
							disabled={emailExists}
							className={emailExists ? 'bg-muted' : ''}
						/>
					</div>

					{/* City, State, ZIP */}
					<div className="grid grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="city">City</Label>
							<Input
								id="city"
								value={formData.city}
								onChange={(e) => handleInputChange('city', e.target.value)}
								placeholder="New York"
								maxLength={50}
								disabled={emailExists}
								className={emailExists ? 'bg-muted' : ''}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="state">State</Label>
							<Input
								id="state"
								value={formData.state}
								onChange={(e) => handleInputChange('state', e.target.value)}
								placeholder="NY"
								maxLength={50}
								disabled={emailExists}
								className={emailExists ? 'bg-muted' : ''}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="zipCode">ZIP Code</Label>
							<Input
								id="zipCode"
								value={formData.zipCode}
								onChange={(e) => handleInputChange('zipCode', e.target.value)}
								placeholder="10001"
								maxLength={5}
								pattern="[0-9]{5}"
								disabled={emailExists}
								className={emailExists ? 'bg-muted' : ''}
							/>
						</div>
					</div>

					{/* Country */}
					<div className="space-y-2">
						<Label htmlFor="country">Country</Label>
						<Input
							id="country"
							value={formData.country}
							onChange={(e) => handleInputChange('country', e.target.value)}
							placeholder="US"
							maxLength={50}
							disabled={emailExists}
							className={emailExists ? 'bg-muted' : ''}
						/>
					</div>

					{/* Company Role */}
					<div className="space-y-2">
						<Label htmlFor="companyRole">
							Company Role <span className="text-red-500">*</span>
						</Label>
						<Select
							value={formData.companyRole}
							onValueChange={(value) => handleInputChange('companyRole', value)}
							required
						>
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="staff">Staff</SelectItem>
								<SelectItem value="manager">Manager</SelectItem>
								<SelectItem value="owner">Owner</SelectItem>
							</SelectContent>
						</Select>
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
									{emailExists ? 'Adding...' : 'Creating...'}
								</>
							) : (
								emailExists ? 'Add to Company' : 'Add Employee'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
