import { Navigation } from "@/components/landing/Navigation";
import { FooterSection } from "@/components/landing/FooterSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const runtime = "edge";

export const metadata = {
	title: "Profile - Atenra",
	description: "Manage your Atenra account settings and preferences.",
};

export default async function ProfilePage() {
	const session = await auth();
	
	if (!session?.user) {
		redirect("/login");
	}

	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold mb-4">User Profile</h1>
						<p className="text-muted-foreground">
							Manage your account settings and preferences
						</p>
					</div>
					
					<Suspense fallback={
						<div className="bg-card/50 backdrop-blur-sm rounded-2xl border p-8 shadow-xl">
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin" />
							</div>
						</div>
					}>
						<ProfileForm />
					</Suspense>
				</div>
				<FooterSection />
			</div>
		</main>
	);
}