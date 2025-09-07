"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StateSelector } from "@/components/ui/state-selector";
import { CitySelector } from "@/components/ui/city-selector";
import { formatPhoneNumber, unformatPhoneNumber } from "@/lib/utils/phone";
import { formatStatusName, formatRoleName } from "@/lib/utils/format";
import { X, Save, Loader2 } from "lucide-react";
import type { User } from "./AdminDashboard";

interface Role {
	id: number;
	name: string;
	description: string;
}

interface UserEditModalProps {
	user: User;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function UserEditModal({ user, isOpen, onClose, onSuccess }: UserEditModalProps) {
	const [formData, setFormData] = useState({
		firstName: user.firstName || "",
		lastName: user.lastName || "",
		displayName: user.displayName || "",
		email: user.email,
		phone: user.phone || "",
		addressLine1: user.addressLine1 || "",
		addressLine2: user.addressLine2 || "",
		city: user.city || "",
		state: user.state || "",
		zipCode: user.zipCode || "",
		country: user.country,
		status: user.status,
		emailVerified: user.emailVerified === 1,
	});
	
	const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
	const [selectedRole, setSelectedRole] = useState<string>(user.roles[0]?.name || '');
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);

	// Fetch available roles
	useEffect(() => {
		const fetchRoles = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/admin/roles");
				if (!response.ok) throw new Error("Failed to fetch roles");
				const roles = await response.json() as Role[];
				setAvailableRoles(roles);
			} catch (error) {
				console.error("Error fetching roles:", error);
			} finally {
				setLoading(false);
			}
		};

		if (isOpen) {
			fetchRoles();
		}
	}, [isOpen]);

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		try {
			setSaving(true);
			
			const selectedRoleObj = availableRoles.find(r => r.name === selectedRole);
			const payload = {
				...formData,
				emailVerified: formData.emailVerified ? 1 : 0,
				roleIds: selectedRoleObj ? [selectedRoleObj.id] : [],
			};

			const response = await fetch(`/api/admin/users/${user.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Failed to update user");
			}

			onSuccess();
		} catch (error) {
			console.error("Error updating user:", error);
		} finally {
			setSaving(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
			<div className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-border">
					<div>
						<h2 className="text-xl font-semibold">Edit User</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Update user information and permissions
						</p>
					</div>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Account Details */}
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) => handleInputChange("firstName", e.target.value)}
									placeholder="Enter first name"
									maxLength={25}
								/>
							</div>
							<div>
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(e) => handleInputChange("lastName", e.target.value)}
									placeholder="Enter last name"
									maxLength={25}
								/>
							</div>
						</div>
						
						<div>
							<Label htmlFor="displayName">Display Name</Label>
							<Input
								id="displayName"
								value={formData.displayName}
								onChange={(e) => handleInputChange("displayName", e.target.value)}
								placeholder="Enter display name"
								maxLength={60}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) => handleInputChange("email", e.target.value)}
									placeholder="Enter email address"
									required
								/>
							</div>
							<div>
								<Label htmlFor="phone">Phone</Label>
								<Input
									id="phone"
									value={formatPhoneNumber(formData.phone)}
									onChange={(e) => {
										const formatted = formatPhoneNumber(e.target.value);
										const unformatted = unformatPhoneNumber(formatted);
										handleInputChange("phone", unformatted);
									}}
									placeholder="(555) 123-4567"
									maxLength={14}
									type="tel"
								/>
							</div>
						</div>
					</div>

					{/* Location */}
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="addressLine1">Address Line 1</Label>
								<Input
									id="addressLine1"
									value={formData.addressLine1}
									onChange={(e) => handleInputChange("addressLine1", e.target.value)}
									placeholder="Street address"
									maxLength={50}
								/>
							</div>
							<div>
								<Label htmlFor="addressLine2">Address Line 2</Label>
								<Input
									id="addressLine2"
									value={formData.addressLine2}
									onChange={(e) => handleInputChange("addressLine2", e.target.value)}
									placeholder="Apartment, suite, etc. (optional)"
									maxLength={50}
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="city">City</Label>
								<CitySelector
									value={formData.city}
									onValueChange={(value) => handleInputChange("city", value)}
									state={formData.state}
									placeholder="Select city..."
								/>
							</div>
							<div>
								<Label htmlFor="state">State</Label>
								<StateSelector
									value={formData.state}
									onValueChange={(value) => handleInputChange("state", value)}
									placeholder="Select state..."
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="zipCode">ZIP Code</Label>
								<Input
									id="zipCode"
									value={formData.zipCode}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, '').slice(0, 5);
										handleInputChange("zipCode", value);
									}}
									placeholder="Enter ZIP code"
									maxLength={5}
									pattern="[0-9]{5}"
								/>
							</div>
							<div>
								<Label htmlFor="country">Country</Label>
								<Input
									id="country"
									value={formData.country}
									onChange={(e) => handleInputChange("country", e.target.value)}
									placeholder="Enter country"
									required
								/>
							</div>
						</div>
					</div>

					{/* Account Status */}
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="status">Status</Label>
								<Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="suspended">Suspended</SelectItem>
										<SelectItem value="deleted">Deleted</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center space-x-2 pt-8">
								<Checkbox
									id="emailVerified"
									checked={formData.emailVerified}
									onCheckedChange={(checked) => handleInputChange("emailVerified", checked as boolean)}
								/>
								<Label htmlFor="emailVerified">Email Verified</Label>
							</div>
						</div>
					</div>

					{/* Role */}
					<div className="space-y-4">
						<div>
							<Label htmlFor="role">Role</Label>
							{loading ? (
								<div className="flex items-center gap-2 text-muted-foreground mt-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									Loading roles...
								</div>
							) : (
								<Select value={selectedRole} onValueChange={setSelectedRole}>
									<SelectTrigger className="mt-2">
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
									<SelectContent>
										{availableRoles.map((role) => (
											<SelectItem key={role.id} value={role.name}>
												<div>
													<p className="font-medium">{formatRoleName(role.name)}</p>
													<p className="text-xs text-muted-foreground">{role.description}</p>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-6 border-t border-border">
						<Button type="button" variant="outline" onClick={onClose} disabled={saving}>
							Cancel
						</Button>
						<Button type="submit" disabled={saving}>
							{saving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}