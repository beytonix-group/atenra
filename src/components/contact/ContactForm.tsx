"use client";

import { Button } from "@/components/ui/button";
import { Mail, User, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ContactForm() {
	const { t } = useLanguage();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const sectionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.1 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get('name') as string,
			email: formData.get('email') as string,
			message: formData.get('message') as string
		};

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const result = await response.json() as { error?: string };
				throw new Error(result.error || 'Failed to send message');
			}

			setSubmitted(true);
		} catch (err) {
			console.error('Form submission error:', err);
			setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 text-center">
				<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
					<Send className="h-8 w-8 text-green-600" />
				</div>
				<h3 className="text-2xl font-semibold mb-4">{t.contact.form.success}</h3>
				<p className="text-muted-foreground mb-6">
					{t.contact.form.successMessage}
				</p>
				<Button
					onClick={() => setSubmitted(false)}
					variant="outline"
				>
					{t.contact.form.sendAnother}
				</Button>
			</div>
		);
	}

	return (
		<div ref={sectionRef}>
			<h2 className={`text-3xl font-light mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>{t.contact.form.title}</h2>

			<form onSubmit={handleSubmit} className={`space-y-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label htmlFor="name" className="block text-sm font-medium mb-2">
							<User className="inline h-4 w-4 mr-2" />
							{t.contact.form.name}
						</label>
						<input
							id="name"
							name="name"
							type="text"
							required
							className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
							placeholder="Your full name"
						/>
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium mb-2">
							<Mail className="inline h-4 w-4 mr-2" />
							{t.contact.form.email}
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
				</div>

				<div>
					<label htmlFor="message" className="block text-sm font-medium mb-2">
						{t.contact.form.message}
					</label>
					<textarea
						id="message"
						name="message"
						required
						rows={6}
						className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
						placeholder="Tell us how we can help you..."
					/>
				</div>

				{error && (
					<div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
						{error}
					</div>
				)}

				<Button
					type="submit"
					className="w-full font-semibold h-12"
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
							{t.contact.form.sending}
						</>
					) : (
						<>
							{t.contact.form.send}
							<Send className="ml-2 h-4 w-4" />
						</>
					)}
				</Button>
			</form>
		</div>
	);
}
