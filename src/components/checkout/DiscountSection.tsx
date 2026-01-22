"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Loader2 } from "lucide-react";

interface DiscountSectionProps {
	onApplyCoupon: (code: string) => Promise<{ valid: boolean; error?: string }>;
	appliedDiscount?: {
		discountCents: number;
		discountType: string | null;
		discountReason: string | null;
	} | null;
	isLoading?: boolean;
}

export function DiscountSection({
	onApplyCoupon,
	appliedDiscount,
	isLoading = false
}: DiscountSectionProps) {
	const [couponCode, setCouponCode] = useState("");
	const [isApplying, setIsApplying] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleApplyCoupon() {
		if (!couponCode.trim()) return;

		setIsApplying(true);
		setError(null);

		try {
			const result = await onApplyCoupon(couponCode.trim().toUpperCase());
			if (!result.valid) {
				setError(result.error || "Invalid coupon code");
			} else {
				setCouponCode("");
			}
		} catch (err) {
			setError("Failed to apply coupon. Please try again.");
		} finally {
			setIsApplying(false);
		}
	}

	return (
		<div className="space-y-4">
			<h3 className="font-medium flex items-center gap-2">
				<Tag className="h-4 w-4" />
				Discount Code
			</h3>

			{/* Coupon Input */}
			<div className="flex gap-2">
				<Input
					placeholder="Enter coupon code"
					value={couponCode}
					onChange={(e) => setCouponCode(e.target.value)}
					disabled={isApplying || isLoading}
					className="flex-1"
				/>
				<Button
					variant="outline"
					onClick={handleApplyCoupon}
					disabled={!couponCode.trim() || isApplying || isLoading}
				>
					{isApplying ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Applying
						</>
					) : (
						"Apply"
					)}
				</Button>
			</div>

			{/* Error Message */}
			{error && (
				<p className="text-sm text-destructive">{error}</p>
			)}

			{/* Applied Discount Display */}
			{appliedDiscount && appliedDiscount.discountCents > 0 && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-3 dark:bg-green-950 dark:border-green-800">
					<p className="text-sm text-green-700 dark:text-green-300">
						{appliedDiscount.discountReason || "Discount applied"}
					</p>
					<p className="text-sm font-medium text-green-800 dark:text-green-200">
						-${(appliedDiscount.discountCents / 100).toFixed(2)}
					</p>
				</div>
			)}

			{/* Note about future discounts */}
			<p className="text-xs text-muted-foreground">
				Coupon codes coming soon. Membership discounts will be applied automatically.
			</p>
		</div>
	);
}
