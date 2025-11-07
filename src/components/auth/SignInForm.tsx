"use client";

import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SignInForm() {
	const { t } = useLanguage();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError(t.auth.signIn.errors.invalidCredentials);
			} else {
				// Force refresh to update session, then redirect
				router.refresh();
				// Use a small delay to ensure session is set before redirect
				setTimeout(() => {
					window.location.href = "/";
				}, 100);
			}
		} catch (error) {
			setError(t.auth.signIn.errors.somethingWentWrong);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		try {
			await signIn("google", { callbackUrl: "/" });
		} catch (error) {
			setError(t.auth.signIn.errors.googleSignInFailed);
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold mb-2">{t.auth.signIn.title}</h1>
				<p className="text-muted-foreground">
					{t.auth.signIn.subtitle}
				</p>
			</div>

			{error && (
				<div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 text-center">
					{error}
				</div>
			)}

			<form onSubmit={handleEmailSignIn} className="space-y-6">
				<div>
					<label htmlFor="email" className="block text-sm font-medium mb-2">
						<Mail className="inline h-4 w-4 mr-2" />
						{t.auth.signIn.email}
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

				<div>
					<label htmlFor="password" className="block text-sm font-medium mb-2">
						<Lock className="inline h-4 w-4 mr-2" />
						{t.auth.signIn.password}
					</label>
					<div className="relative">
						<input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							required
							className="w-full px-4 py-3 pr-12 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
							placeholder="Enter your password"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							{showPassword ? (
								<EyeOff className="h-5 w-5" />
							) : (
								<Eye className="h-5 w-5" />
							)}
						</button>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<label className="flex items-center space-x-2 text-sm">
						<input type="checkbox" className="rounded border-border" />
						<span>{t.auth.signIn.rememberMe}</span>
					</label>
					<Link href="/forgot-password" className="text-sm text-primary hover:underline">
						{t.auth.signIn.forgotPassword}
					</Link>
				</div>

				<Button 
					type="submit" 
					className="w-full font-semibold h-12"
					disabled={isLoading}
				>
					{isLoading ? (
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
					) : (
						<>
							{t.auth.signIn.signInButton}
							<ArrowRight className="ml-2 h-4 w-4" />
						</>
					)}
				</Button>
			</form>

			<div className="relative my-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-border"></div>
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="bg-card px-4 text-muted-foreground">{t.auth.signIn.or}</span>
				</div>
			</div>

			<Button
				onClick={handleGoogleSignIn}
				variant="outline"
				className="w-full font-semibold h-12"
				disabled={isLoading}
			>
				<svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="currentColor"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="currentColor"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="currentColor"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				{t.auth.signIn.signInWithGoogle}
			</Button>

			<div className="text-center mt-6">
				<p className="text-sm text-muted-foreground">
					{t.auth.signIn.noAccount}{" "}
					<Link href="/register" className="text-primary hover:underline font-medium">
						{t.auth.signIn.signUp}
					</Link>
				</p>
			</div>
		</div>
	);
}