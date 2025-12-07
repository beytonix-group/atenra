import { Navigation } from "@/components/landing/Navigation";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";


export const metadata = {
	title: "Reset Password - Atenra",
	description: "Reset your Atenra account password.",
};

export default function ForgotPasswordPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-16 flex items-center justify-center min-h-screen">
				<div className="w-full max-w-md px-4">
					<ForgotPasswordForm />
				</div>
			</div>
		</main>
	);
}