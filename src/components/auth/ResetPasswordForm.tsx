"use client";

import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordFormContent() {
	const [isLoading, setIsLoading] = useState(false);
	const [passwordReset, setPasswordReset] = useState(false);
	const [error, setError] = useState("");
	const [validToken, setValidToken] = useState<boolean | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	useEffect(() => {
		if (!token) {
			setValidToken(false);
			return;
		}

		const validateToken = async () => {
			try {
				const response = await fetch("/api/auth/verify-reset-token", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ token }),
				});

				setValidToken(response.ok);
			} catch {
				setValidToken(false);
			}
		};

		validateToken();
	}, [token]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, password }),
			});

			if (response.ok) {
				setPasswordReset(true);
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

	if (validToken === null) {
		return (
			<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
				<p className="mt-4 text-muted-foreground">Validating reset link...</p>
			</div>
		);
	}

	if (validToken === false) {
		return (
			<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl text-center">
				<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
					<Lock className="h-8 w-8 text-red-600" />
				</div>
				<h2 className="text-2xl font-bold mb-4">Invalid or expired link</h2>
				<p className="text-muted-foreground mb-6">
					This password reset link is invalid or has expired. Please request a new one.
				</p>
				<Link href="/forgot-password">
					<Button className="w-full">Request new reset link</Button>
				</Link>
			</div>
		);
	}

	if (passwordReset) {
		return (
			<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl text-center">
				<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
					<CheckCircle className="h-8 w-8 text-green-600" />
				</div>
				<h2 className="text-2xl font-bold mb-4">Password reset successful</h2>
				<p className="text-muted-foreground mb-6">
					Your password has been reset successfully. You can now sign in with your new password.
				</p>
				<Link href="/login">
					<Button className="w-full">Sign in</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">Set new password</h1>
				<p className="text-muted-foreground">
					Enter your new password below
				</p>
			</div>

			{error && (
				<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 text-center">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label htmlFor="password" className="block text-sm font-medium mb-2">
						<Lock className="inline h-4 w-4 mr-2" />
						New Password
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						minLength={8}
						className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
						placeholder="Enter new password"
					/>
				</div>

				<div>
					<label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
						<Lock className="inline h-4 w-4 mr-2" />
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						minLength={8}
						className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
						placeholder="Confirm new password"
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
						"Reset password"
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

export function ResetPasswordForm() {
	return (
		<Suspense fallback={<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl text-center">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
			<p className="mt-4 text-muted-foreground">Loading...</p>
		</div>}>
			<ResetPasswordFormContent />
		</Suspense>
	);
}