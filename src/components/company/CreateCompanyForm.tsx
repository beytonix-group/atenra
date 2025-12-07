"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, CheckCircle, AlertCircle, X, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ServiceCategory {
	id: number;
	name: string;
	description: string | null;
	parentId: number | null;
}

interface CreateCompanyFormProps {
	categories: ServiceCategory[];
}

interface FormData {
	name: string;
	einNumber: string;
	description: string;
	websiteUrl: string;
	logoUrl: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	phone: string;
	email: string;
	status: string;
	licenseNumber: string;
	insuranceNumber: string;
	isPublic: boolean;
	memo: string;
	categoryIds: number[];
}

export function CreateCompanyForm({ categories }: CreateCompanyFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [categorySearch, setCategorySearch] = useState("");
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const [formData, setFormData] = useState<FormData>({
		name: "",
		einNumber: "",
		description: "",
		websiteUrl: "",
		logoUrl: "",
		addressLine1: "",
		addressLine2: "",
		city: "",
		state: "",
		zipCode: "",
		country: "US",
		phone: "",
		email: "",
		status: "active",
		licenseNumber: "",
		insuranceNumber: "",
		isPublic: true,
		memo: "",
		categoryIds: [],
	});

	const handleInputChange = (field: keyof FormData, value: string | boolean | number[]) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Phone number formatting
	const formatPhoneNumber = (value: string) => {
		// Remove all non-numeric characters
		const phoneNumber = value.replace(/\D/g, "");

		// Format as (XXX) XXX-XXXX
		if (phoneNumber.length <= 3) {
			return phoneNumber;
		} else if (phoneNumber.length <= 6) {
			return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
		} else {
			return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
		}
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value);
		handleInputChange("phone", formatted);
	};

	const handleCategoryToggle = (categoryId: number) => {
		setFormData((prev) => ({
			...prev,
			categoryIds: prev.categoryIds.includes(categoryId)
				? prev.categoryIds.filter((id) => id !== categoryId)
				: [...prev.categoryIds, categoryId],
		}));
	};

	// Filter categories based on search
	const getFilteredCategories = () => {
		if (!categorySearch.trim()) {
			return categories;
		}

		const searchLower = categorySearch.toLowerCase().trim();
		const matchingIds = new Set<number>();

		// Find all categories that match the search
		categories.forEach((category) => {
			if (category.name.toLowerCase().includes(searchLower)) {
				matchingIds.add(category.id);

				// Add parent hierarchy
				let currentCategory = category;
				while (currentCategory.parentId !== null) {
					matchingIds.add(currentCategory.parentId);
					currentCategory = categories.find((c) => c.id === currentCategory.parentId)!;
				}

				// Add all children
				const addChildren = (parentId: number) => {
					categories
						.filter((c) => c.parentId === parentId)
						.forEach((child) => {
							matchingIds.add(child.id);
							addChildren(child.id);
						});
				};
				addChildren(category.id);
			}
		});

		return categories.filter((cat) => matchingIds.has(cat.id));
	};

	const filteredCategories = getFilteredCategories();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setNotification(null);

		try {
			const response = await fetch("/api/companies", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json() as {
				success?: boolean;
				companyId?: number;
				message?: string;
				error?: string;
			};

			if (!response.ok) {
				throw new Error(data.error || "Failed to create company");
			}

			// Show success notification with company name
			setNotification({
				type: "success",
				message: `${formData.name} has been created successfully`,
			});

			// Redirect to marketplace after showing the message
			setTimeout(() => {
				router.push("/marketplace");
			}, 2000);
		} catch (error: unknown) {
			setNotification({
				type: "error",
				message: error instanceof Error ? error.message : "An unexpected error occurred",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Notification */}
			{notification && (
				<Alert
					variant={notification.type === "error" ? "destructive" : "default"}
					className={`relative pr-12 ${
						notification.type === "success"
							? "border-green-500 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100"
							: ""
					}`}
				>
					{notification.type === "success" ? (
						<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
					) : (
						<AlertCircle className="h-4 w-4" />
					)}
					<AlertDescription className={notification.type === "success" ? "text-green-900 dark:text-green-100" : ""}>
						{notification.message}
					</AlertDescription>
					{notification.type === "error" && (
						<button
							type="button"
							onClick={() => setNotification(null)}
							className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</Alert>
			)}

			{/* Basic Information */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5" />
						Basic Information
					</CardTitle>
					<CardDescription>Enter the company&apos;s core details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">
								Company Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) => handleInputChange("name", e.target.value)}
								placeholder="e.g., Acme Corporation"
								required
							/>
							<p className="text-xs text-muted-foreground">
								A URL-friendly slug will be automatically generated from the company name
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="einNumber">
								EIN Number <span className="text-red-500">*</span>
							</Label>
							<Input
								id="einNumber"
								value={formData.einNumber}
								onChange={(e) => {
									// Format EIN as XX-XXXXXXX
									const value = e.target.value.replace(/\D/g, "");
									let formatted = value;
									if (value.length > 2) {
										formatted = `${value.slice(0, 2)}-${value.slice(2, 9)}`;
									}
									handleInputChange("einNumber", formatted);
								}}
								placeholder="XX-XXXXXXX"
								maxLength={10}
								required
								pattern="\d{2}-\d{7}"
								title="EIN must be in format XX-XXXXXXX (9 digits)"
							/>
							<p className="text-xs text-muted-foreground">
								Employer Identification Number (Format: XX-XXXXXXX)
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							placeholder="Brief description of the company..."
							rows={4}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange("email", e.target.value)}
								placeholder="contact@company.com"
								pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
								title="Please enter a valid email address"
							/>
							<p className="text-xs text-muted-foreground">
								Format: name@example.com
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								type="tel"
								value={formData.phone}
								onChange={handlePhoneChange}
								placeholder="(555) 123-4567"
								maxLength={14}
							/>
							<p className="text-xs text-muted-foreground">
								Format: (555) 123-4567
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="websiteUrl">Website URL</Label>
							<Input
								id="websiteUrl"
								type="url"
								value={formData.websiteUrl}
								onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
								placeholder="https://company.com"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="logoUrl">Logo URL</Label>
							<Input
								id="logoUrl"
								type="url"
								value={formData.logoUrl}
								onChange={(e) => handleInputChange("logoUrl", e.target.value)}
								placeholder="https://company.com/logo.png"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Address Information */}
			<Card>
				<CardHeader>
					<CardTitle>Address Information</CardTitle>
					<CardDescription>Company location details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="addressLine1">Address Line 1</Label>
						<Input
							id="addressLine1"
							value={formData.addressLine1}
							onChange={(e) => handleInputChange("addressLine1", e.target.value)}
							placeholder="123 Main Street"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="addressLine2">Address Line 2</Label>
						<Input
							id="addressLine2"
							value={formData.addressLine2}
							onChange={(e) => handleInputChange("addressLine2", e.target.value)}
							placeholder="Suite 100"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="city">City</Label>
							<Input
								id="city"
								value={formData.city}
								onChange={(e) => handleInputChange("city", e.target.value)}
								placeholder="San Francisco"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="state">State</Label>
							<Input
								id="state"
								value={formData.state}
								onChange={(e) => handleInputChange("state", e.target.value)}
								placeholder="CA"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="zipCode">ZIP Code</Label>
							<Input
								id="zipCode"
								value={formData.zipCode}
								onChange={(e) => handleInputChange("zipCode", e.target.value)}
								placeholder="94102"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="country">Country</Label>
						<Input
							id="country"
							value={formData.country}
							onChange={(e) => handleInputChange("country", e.target.value)}
							placeholder="US"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Service Categories */}
			<Card>
				<CardHeader>
					<CardTitle>Service Categories</CardTitle>
					<CardDescription>Select the services this company provides</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Search Input */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search categories..."
							value={categorySearch}
							onChange={(e) => setCategorySearch(e.target.value)}
							className="pl-10"
						/>
						{categorySearch && (
							<button
								type="button"
								onClick={() => setCategorySearch("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					{/* Categories List */}
					<div className="max-h-96 overflow-y-auto p-2 space-y-4">
						{filteredCategories.filter((cat) => cat.parentId === null).length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<p>No categories found matching &quot;{categorySearch}&quot;</p>
								<button
									type="button"
									onClick={() => setCategorySearch("")}
									className="text-primary hover:underline mt-2 text-sm"
								>
									Clear search
								</button>
							</div>
						) : (
							<>
								{/* Group categories by parent */}
								{filteredCategories
									.filter((cat) => cat.parentId === null)
									.sort((a, b) => a.name.localeCompare(b.name))
									.map((parentCategory) => {
								const childCategories = filteredCategories
									.filter((cat) => cat.parentId === parentCategory.id)
									.sort((a, b) => a.name.localeCompare(b.name));

								return (
									<div key={parentCategory.id} className="space-y-2">
										{/* Parent Category */}
										<div className="flex items-start space-x-2 pb-2 border-b">
											<Checkbox
												id={`category-${parentCategory.id}`}
												checked={formData.categoryIds.includes(parentCategory.id)}
												onCheckedChange={() => handleCategoryToggle(parentCategory.id)}
											/>
											<label
												htmlFor={`category-${parentCategory.id}`}
												className="text-sm font-bold leading-none cursor-pointer"
											>
												{parentCategory.name}
											</label>
										</div>

										{/* Child Categories */}
										{childCategories.length > 0 && (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
												{childCategories.map((childCategory) => {
													// Get sub-children
													const subChildren = filteredCategories
														.filter((cat) => cat.parentId === childCategory.id)
														.sort((a, b) => a.name.localeCompare(b.name));

													return (
														<div key={childCategory.id} className="space-y-1">
															{/* Child Category */}
															<div className="flex items-start space-x-2">
																<Checkbox
																	id={`category-${childCategory.id}`}
																	checked={formData.categoryIds.includes(childCategory.id)}
																	onCheckedChange={() => handleCategoryToggle(childCategory.id)}
																/>
																<label
																	htmlFor={`category-${childCategory.id}`}
																	className="text-sm font-medium leading-none cursor-pointer"
																>
																	{childCategory.name}
																</label>
															</div>

															{/* Sub-Child Categories */}
															{subChildren.length > 0 && (
																<div className="pl-6 space-y-1">
																	{subChildren.map((subChild) => (
																		<div key={subChild.id} className="flex items-start space-x-2">
																			<Checkbox
																				id={`category-${subChild.id}`}
																				checked={formData.categoryIds.includes(subChild.id)}
																				onCheckedChange={() => handleCategoryToggle(subChild.id)}
																			/>
																			<label
																				htmlFor={`category-${subChild.id}`}
																				className="text-xs leading-none cursor-pointer text-muted-foreground"
																			>
																				{subChild.name}
																			</label>
																		</div>
																	))}
																</div>
															)}
														</div>
													);
												})}
											</div>
										)}
									</div>
								);
							})}
							</>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Additional Information */}
			<Card>
				<CardHeader>
					<CardTitle>Additional Information</CardTitle>
					<CardDescription>Licensing, status, and notes</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="licenseNumber">License Number</Label>
							<Input
								id="licenseNumber"
								value={formData.licenseNumber}
								onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
								placeholder="LIC-123456"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="insuranceNumber">Insurance Number</Label>
							<Input
								id="insuranceNumber"
								value={formData.insuranceNumber}
								onChange={(e) => handleInputChange("insuranceNumber", e.target.value)}
								placeholder="INS-789012"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select
								value={formData.status}
								onValueChange={(value) => handleInputChange("status", value)}
							>
								<SelectTrigger id="status">
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="pending_verification">Pending Verification</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center space-x-2 pt-8">
							<Checkbox
								id="isPublic"
								checked={formData.isPublic}
								onCheckedChange={(checked) => handleInputChange("isPublic", checked as boolean)}
							/>
							<label
								htmlFor="isPublic"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
							>
								Show in public marketplace
							</label>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="memo">Internal Memo</Label>
						<Textarea
							id="memo"
							value={formData.memo}
							onChange={(e) => handleInputChange("memo", e.target.value)}
							placeholder="Internal notes about this company..."
							rows={3}
						/>
						<p className="text-xs text-muted-foreground">
							This memo is for internal use only and will not be visible to the public
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Form Actions */}
			<div className="flex gap-4 justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating...
						</>
					) : (
						"Create Company"
					)}
				</Button>
			</div>
		</form>
	);
}
