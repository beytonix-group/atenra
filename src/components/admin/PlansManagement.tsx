"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Edit, Loader2, CheckCircle2, XCircle, Save, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Plan {
	id: number;
	name: string;
	description: string | null;
	price: number;
	currency: string;
	billing_period: string;
	features: string | null;
	is_active: number;
	stripe_product_id: string | null;
	stripe_price_id: string | null;
	trial_days: number | null;
	created_at: number;
	updated_at: number;
}

interface EditingPlan {
	name: string;
	price: number;
	description: string;
	features: string[];
	stripeProductId: string;
	stripePriceId: string;
	trialDays: number;
}

export function PlansManagement() {
	const [plans, setPlans] = useState<Plan[]>([]);
	const [loading, setLoading] = useState(true);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editingPlan, setEditingPlan] = useState<EditingPlan | null>(null);
	const [saving, setSaving] = useState(false);

	// Fetch plans on mount
	useEffect(() => {
		fetchPlans();
	}, []);

	const fetchPlans = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/admin/plans");
			const data = await response.json() as { success?: boolean; plans?: Plan[] };

			if (data.success && data.plans) {
				setPlans(data.plans);
			} else {
				toast.error("Failed to fetch plans");
			}
		} catch (error) {
			console.error("Error fetching plans:", error);
			toast.error("Failed to fetch plans");
		} finally {
			setLoading(false);
		}
	};

	const openEditDialog = (plan: Plan) => {
		const features = parseFeatures(plan.features);
		setEditingPlan({
			name: plan.name,
			price: plan.price,
			description: plan.description || "",
			features: features,
			stripeProductId: plan.stripe_product_id || "",
			stripePriceId: plan.stripe_price_id || "",
			trialDays: plan.trial_days || 0,
		});
		setEditDialogOpen(true);
	};

	const handleSave = async () => {
		if (!editingPlan) return;

		// Validation
		if (editingPlan.price <= 0) {
			toast.error("Price must be greater than 0");
			return;
		}

		try {
			setSaving(true);

			// Build request body with only changed fields
			const updates: any = {};

			if (editingPlan.price) updates.price = editingPlan.price;
			if (editingPlan.description) updates.description = editingPlan.description;
			if (editingPlan.features.length > 0) updates.features = editingPlan.features;
			if (editingPlan.stripeProductId) updates.stripeProductId = editingPlan.stripeProductId;
			if (editingPlan.stripePriceId) updates.stripePriceId = editingPlan.stripePriceId;
			if (editingPlan.trialDays !== undefined) updates.trialDays = editingPlan.trialDays;

			const response = await fetch(`/api/admin/plans/${encodeURIComponent(editingPlan.name)}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updates),
			});

			const data = await response.json() as { success?: boolean; error?: string; plan?: Plan };

			if (response.ok && data.success) {
				toast.success(`${editingPlan.name} plan updated successfully`);
				setEditDialogOpen(false);
				setEditingPlan(null);
				fetchPlans(); // Refresh plans
			} else {
				toast.error(data.error || "Failed to update plan");
			}
		} catch (error) {
			console.error("Error updating plan:", error);
			toast.error("Failed to update plan");
		} finally {
			setSaving(false);
		}
	};

	const addFeature = () => {
		if (!editingPlan) return;
		setEditingPlan({
			...editingPlan,
			features: [...editingPlan.features, ""],
		});
	};

	const updateFeature = (index: number, value: string) => {
		if (!editingPlan) return;
		const newFeatures = [...editingPlan.features];
		newFeatures[index] = value;
		setEditingPlan({
			...editingPlan,
			features: newFeatures,
		});
	};

	const removeFeature = (index: number) => {
		if (!editingPlan) return;
		const newFeatures = editingPlan.features.filter((_, i) => i !== index);
		setEditingPlan({
			...editingPlan,
			features: newFeatures,
		});
	};

	const parseFeatures = (featuresJson: string | null): string[] => {
		if (!featuresJson) return [];
		try {
			return JSON.parse(featuresJson);
		} catch {
			return [];
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Plans Management</h1>
					<p className="text-muted-foreground mt-2">
						Manage subscription plans and Stripe integration
					</p>
				</div>

				{/* Plans Grid */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{plans.map((plan) => {
						const features = parseFeatures(plan.features);
						const hasStripeIntegration = !!(plan.stripe_product_id && plan.stripe_price_id);

						return (
							<Card key={plan.id} className="relative">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-2xl">{plan.name}</CardTitle>
											<CardDescription className="mt-1">
												{plan.description}
											</CardDescription>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => openEditDialog(plan)}
										>
											<Edit className="h-4 w-4" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Price */}
									<div className="flex items-baseline gap-1">
										<span className="text-4xl font-bold">${plan.price}</span>
										<span className="text-muted-foreground">
											/{plan.billing_period}
										</span>
									</div>

									{/* Stripe Integration Status */}
									<div className="space-y-2">
										<div className="flex items-center gap-2 text-sm">
											{hasStripeIntegration ? (
												<>
													<CheckCircle2 className="h-4 w-4 text-green-500" />
													<span className="text-green-600 dark:text-green-400">
														Stripe Connected
													</span>
												</>
											) : (
												<>
													<XCircle className="h-4 w-4 text-amber-500" />
													<span className="text-amber-600 dark:text-amber-400">
														Stripe Not Configured
													</span>
												</>
											)}
										</div>

										{plan.stripe_product_id && (
											<div className="text-xs text-muted-foreground font-mono">
												Product: {plan.stripe_product_id}
											</div>
										)}
										{plan.stripe_price_id && (
											<div className="text-xs text-muted-foreground font-mono">
												Price: {plan.stripe_price_id}
											</div>
										)}
									</div>

									{/* Trial Days */}
									{plan.trial_days && plan.trial_days > 0 && (
										<Badge variant="secondary">
											{plan.trial_days} day free trial
										</Badge>
									)}

									{/* Features */}
									{features.length > 0 && (
										<div className="space-y-2">
											<div className="text-sm font-medium">Features:</div>
											<ul className="space-y-1.5">
												{features.slice(0, 4).map((feature, idx) => (
													<li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
														<span className="text-primary mt-0.5">•</span>
														<span className="flex-1">{feature}</span>
													</li>
												))}
												{features.length > 4 && (
													<li className="text-sm text-muted-foreground">
														+ {features.length - 4} more features
													</li>
												)}
											</ul>
										</div>
									)}

									{/* Status Badge */}
									<Badge variant={plan.is_active ? "default" : "secondary"}>
										{plan.is_active ? "Active" : "Inactive"}
									</Badge>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Edit Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit {editingPlan?.name} Plan</DialogTitle>
						<DialogDescription>
							Update plan details, pricing, features, and Stripe integration
						</DialogDescription>
					</DialogHeader>

					{editingPlan && (
						<div className="space-y-6 py-4">
							{/* Description */}
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									placeholder="Plan description"
									value={editingPlan.description}
									onChange={(e) =>
										setEditingPlan({
											...editingPlan,
											description: e.target.value,
										})
									}
									rows={2}
								/>
							</div>

							{/* Price */}
							<div className="space-y-2">
								<Label htmlFor="price">Price (USD)</Label>
								<div className="relative">
									<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="price"
										type="number"
										min="0"
										step="0.01"
										value={editingPlan.price}
										onChange={(e) =>
											setEditingPlan({
												...editingPlan,
												price: parseFloat(e.target.value) || 0,
											})
										}
										className="pl-9"
									/>
								</div>
							</div>

							{/* Features */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label>Features</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addFeature}
									>
										<Plus className="h-4 w-4 mr-1" />
										Add Feature
									</Button>
								</div>
								<div className="space-y-2">
									{editingPlan.features.map((feature, index) => (
										<div key={index} className="flex gap-2">
											<Input
												placeholder={`Feature ${index + 1}`}
												value={feature}
												onChange={(e) => updateFeature(index, e.target.value)}
											/>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => removeFeature(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
									{editingPlan.features.length === 0 && (
										<p className="text-sm text-muted-foreground">
											No features added. Click &quot;Add Feature&quot; to add one.
										</p>
									)}
								</div>
							</div>

							{/* Divider */}
							<div className="border-t pt-4">
								<h4 className="text-sm font-medium mb-4">Stripe Integration</h4>

								<div className="space-y-4">
									{/* Stripe Product ID */}
									<div className="space-y-2">
										<Label htmlFor="stripeProductId">
											Stripe Product ID{" "}
											<span className="text-muted-foreground font-normal">(optional)</span>
										</Label>
										<Input
											id="stripeProductId"
											placeholder="prod_xxxxx"
											value={editingPlan.stripeProductId}
											onChange={(e) =>
												setEditingPlan({
													...editingPlan,
													stripeProductId: e.target.value,
												})
											}
										/>
									</div>

									{/* Stripe Price ID */}
									<div className="space-y-2">
										<Label htmlFor="stripePriceId">
											Stripe Price ID{" "}
											<span className="text-muted-foreground font-normal">(optional)</span>
										</Label>
										<Input
											id="stripePriceId"
											placeholder="price_xxxxx"
											value={editingPlan.stripePriceId}
											onChange={(e) =>
												setEditingPlan({
													...editingPlan,
													stripePriceId: e.target.value,
												})
											}
										/>
									</div>

									{/* Trial Days */}
									<div className="space-y-2">
										<Label htmlFor="trialDays">Trial Days</Label>
										<Input
											id="trialDays"
											type="number"
											min="0"
											value={editingPlan.trialDays}
											onChange={(e) =>
												setEditingPlan({
													...editingPlan,
													trialDays: parseInt(e.target.value) || 0,
												})
											}
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setEditDialogOpen(false);
								setEditingPlan(null);
							}}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={saving}>
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
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
