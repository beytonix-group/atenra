"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Loader2 } from "lucide-react";

interface Role {
	id: number;
	name: string;
	description: string;
}

interface UserCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function UserCreateModal({ isOpen, onClose, onSuccess }: UserCreateModalProps) {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		displayName: "",
		email: "",
		password: "",
		phone: "",
		city: "",
		state: "",
		country: "US",
		status: "active" as "active" | "suspended" | "deleted",
		emailVerified: false,
	});
	
	const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
	const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
	const [loading, setLoading] = useState(false);
	const [creating, setCreating] = useState(false);

	// Reset form when modal opens
	useEffect(() => {
		if (isOpen) {
			setFormData({
				firstName: "",
				lastName: "",
				displayName: "",
				email: "",
				password: "",
				phone: "",
				city: "",
				state: "",
				country: "US",
				status: "active",
				emailVerified: false,
			});
			setSelectedRoles([]);
		}
	}, [isOpen]);

	// Fetch available roles
	useEffect(() => {
		const fetchRoles = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/admin/roles");
				if (!response.ok) throw new Error("Failed to fetch roles");
				const roles = await response.json() as Role[];
				setAvailableRoles(roles);
				
				// Auto-select 'user' role if available
				const userRole = roles.find((role) => role.name === "user");
				if (userRole) {
					setSelectedRoles([userRole.id]);
				}
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

	const handleRoleToggle = (roleId: number, checked: boolean) => {
		setSelectedRoles(prev => {
			if (checked) {
				return [...prev, roleId];
			} else {
				return prev.filter(id => id !== roleId);
			}
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		try {
			setCreating(true);
			
			const payload = {
				...formData,
				emailVerified: formData.emailVerified ? 1 : 0,
				roleIds: selectedRoles,
			};

			const response = await fetch("/api/admin/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Failed to create user");
			}

			onSuccess();
		} catch (error) {
			console.error("Error creating user:", error);
		} finally {
			setCreating(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
			<div className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-border">
					<div>
						<h2 className="text-xl font-semibold">Create New User</h2>
						<p className="text-sm text-muted-foreground mt-1">
							Add a new user to the system
						</p>
					</div>
					<Button variant="ghost" size="sm" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<h3 className="font-medium">Basic Information</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(e) => handleInputChange("firstName", e.target.value)}
									placeholder="Enter first name"
								/>
							</div>
							<div>
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(e) => handleInputChange("lastName", e.target.value)}
									placeholder="Enter last name"
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
							/>
						</div>

						<div>
							<Label htmlFor="email">Email *</Label>
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
							<Label htmlFor="password">Password *</Label>
							<Input
								id="password"
								type="password"
								value={formData.password}
								onChange={(e) => handleInputChange("password", e.target.value)}
								placeholder="Enter password"
								required
								minLength={8}
							/>
						</div>

						<div>
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								value={formData.phone}
								onChange={(e) => handleInputChange("phone", e.target.value)}
								placeholder="Enter phone number"
							/>
						</div>
					</div>

					{/* Location */}
					<div className="space-y-4">
						<h3 className="font-medium">Location</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									value={formData.city}
									onChange={(e) => handleInputChange("city", e.target.value)}
									placeholder="Enter city"
								/>
							</div>
							<div>
								<Label htmlFor="state">State</Label>
								<Input
									id="state"
									value={formData.state}
									onChange={(e) => handleInputChange("state", e.target.value)}
									placeholder="Enter state"
								/>
							</div>
							<div>
								<Label htmlFor="country">Country *</Label>
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
						<h3 className="font-medium">Account Status</h3>
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

					{/* Roles */}
					<div className="space-y-4">
						<h3 className="font-medium">Roles</h3>
						{loading ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" />
								Loading roles...
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{availableRoles.map((role) => (
									<div key={role.id} className="flex items-center space-x-2">
										<Checkbox
											id={`role-${role.id}`}
											checked={selectedRoles.includes(role.id)}
											onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
										/>
										<Label htmlFor={`role-${role.id}`} className="flex-1">
											<span className="font-medium">{role.name}</span>
											<p className="text-xs text-muted-foreground">{role.description}</p>
										</Label>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-6 border-t border-border">
						<Button type="button" variant="outline" onClick={onClose} disabled={creating}>
							Cancel
						</Button>
						<Button type="submit" disabled={creating}>
							{creating ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Plus className="mr-2 h-4 w-4" />
									Create User
								</>
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}