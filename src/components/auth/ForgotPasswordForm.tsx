"use client";

import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;

		try {
			const response = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			if (response.ok) {
				setEmailSent(true);
			} else {
				const result = await response.json();
				setError(result.message || "Something went wrong");
			}
		} catch (error) {
			setError("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (emailSent) {
		return (
			<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl text-center">
				<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle className="h-8 w-8 text-blue-600" />
				</div>
				<h2 className="text-2xl font-bold mb-4">Check your email</h2>
				<p className="text-muted-foreground mb-6">
					If an account with that email exists, we&apos;ve sent you a password reset link.
				</p>
				<Link href="/login">
					<Button variant="outline" className="w-full">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to sign in
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Reset password</h1>
				<p className="text-muted-foreground">
					Enter your email and we&apos;ll send you a reset link
				</p>
			</div>

			{error && (
				<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 text-center">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label htmlFor="email" className="block text-sm font-medium mb-2">
						<Mail className="inline h-4 w-4 mr-2" />
						Email address
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
						placeholder="your.email@example.com"
					/>
				</div>

				<Button 
					type="submit" 
					className="w-full font-semibold h-12"
					disabled={isLoading}
				>
					{isLoading ? (
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
					) : (
						"Send reset link"
					)}
				</Button>
			</form>

			<div className="text-center mt-6">
				<Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
					<ArrowLeft className="inline h-4 w-4 mr-1" />
					Back to sign in
				</Link>
			</div>
		</div>
	);
}