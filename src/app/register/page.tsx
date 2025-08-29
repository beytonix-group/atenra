import { Navigation } from "@/components/landing/Navigation";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export const runtime = process.env.NODE_ENV === "production" ? "edge" : undefined;

export const metadata = {
	title: "Sign Up - Atenra",
	description: "Create your Atenra account to access premium service matching features.",
};

export default async function RegisterPage() {
	const session = await auth();
	
	if (session?.user) {
		redirect("/");
	}

	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-16 flex items-center justify-center min-h-screen">
				<div className="w-full max-w-md px-4">
					<SignUpForm />
				</div>
			</div>
		</main>
	);
}