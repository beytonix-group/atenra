import { Navigation } from "@/components/landing/Navigation";
import { FooterSection } from "@/components/landing/FooterSection";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { Suspense } from "react";
import { Loader2, User } from "lucide-react";

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
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="flex items-center gap-2 mb-6">
						<User className="h-5 w-5 text-muted-foreground" />
						<h1 className="text-xl font-medium">Profile Settings</h1>
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