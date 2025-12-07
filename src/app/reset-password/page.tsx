import { Navigation } from "@/components/landing/Navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";


export const metadata = {
	title: "Reset Password - Atenra",
	description: "Create a new password for your Atenra account.",
};

export default function ResetPasswordPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-16 flex items-center justify-center min-h-screen">
				<div className="w-full max-w-md px-4">
					<ResetPasswordForm />
				</div>
			</div>
		</main>
	);
}