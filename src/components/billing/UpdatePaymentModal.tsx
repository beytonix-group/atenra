"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface UpdatePaymentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function UpdatePaymentModal({
	open,
	onOpenChange,
	onSuccess,
}: UpdatePaymentModalProps) {
	const [loading, setLoading] = useState(false);
	const [cardNumber, setCardNumber] = useState("");
	const [expiry, setExpiry] = useState("");
	const [cvc, setCvc] = useState("");
	const [name, setName] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// TODO: Implement Stripe payment method update
			// This should use Stripe Elements or Stripe.js to tokenize the card
			// Then send the token to your API to update the payment method

			// const response = await fetch('/api/billing/update-payment', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ token: stripeToken }),
			// });

			// if (response.ok) {
			//   onSuccess();
			//   onOpenChange(false);
			// }

			// For now, just simulate success
			await new Promise(resolve => setTimeout(resolve, 1000));
			alert("Payment method update will be implemented with Stripe");
			onOpenChange(false);

		} catch (error) {
			console.error("Error updating payment method:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatCardNumber = (value: string) => {
		const cleaned = value.replace(/\s/g, "");
		const match = cleaned.match(/.{1,4}/g);
		return match ? match.join(" ") : cleaned;
	};

	const formatExpiry = (value: string) => {
		const cleaned = value.replace(/\D/g, "");
		if (cleaned.length >= 2) {
			return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
		}
		return cleaned;
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Update Payment Method</DialogTitle>
					<DialogDescription>
						Enter your card details to update your payment method
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Cardholder Name</Label>
						<Input
							id="name"
							placeholder="John Doe"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cardNumber">Card Number</Label>
						<Input
							id="cardNumber"
							placeholder="1234 5678 9012 3456"
							value={cardNumber}
							onChange={(e) => {
								const formatted = formatCardNumber(e.target.value);
								if (formatted.replace(/\s/g, "").length <= 16) {
									setCardNumber(formatted);
								}
							}}
							maxLength={19}
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="expiry">Expiry Date</Label>
							<Input
								id="expiry"
								placeholder="MM/YY"
								value={expiry}
								onChange={(e) => {
									const formatted = formatExpiry(e.target.value);
									if (formatted.replace(/\//g, "").length <= 4) {
										setExpiry(formatted);
									}
								}}
								maxLength={5}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="cvc">CVC</Label>
							<Input
								id="cvc"
								placeholder="123"
								value={cvc}
								onChange={(e) => {
									const value = e.target.value.replace(/\D/g, "");
									if (value.length <= 4) {
										setCvc(value);
									}
								}}
								maxLength={4}
								required
							/>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								"Update Payment"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
