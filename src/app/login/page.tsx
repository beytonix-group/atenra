import { Navigation } from "@/components/landing/Navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export const runtime = "edge";

export const metadata = {
	title: "Sign In - Atenra",
	description: "Sign in to your Atenra account to access premium service matching features.",
};

export default async function LoginPage() {
	const session = await auth();
	
	if (session?.user) {
		redirect("/");
	}

	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-16 flex items-center justify-center min-h-screen">
				<div className="w-full max-w-md px-4">
					<SignInForm />
				</div>
			</div>
		</main>
	);
}