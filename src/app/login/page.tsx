import { Navigation } from "@/components/landing/Navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export const metadata = {
	title: "Sign In - Atenra",
	description: "Sign in to your Atenra account to access premium service matching features.",
};

interface LoginPageProps {
	searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const session = await auth();

	if (session?.user) {
		redirect("/");
	}

	const { error } = await searchParams;

	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-16 flex items-center justify-center min-h-screen">
				<div className="w-full max-w-md px-4">
					<SignInForm authError={error} />
				</div>
			</div>
		</main>
	);
}