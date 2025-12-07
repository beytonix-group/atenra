import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { isSuperAdmin } from "@/lib/auth-helpers";


export const metadata = {
	title: "Profile - Atenra",
	description: "Manage your account settings and preferences.",
};

export default async function ProfilePage() {
	const session = await auth();
	
	if (!session?.user) {
		redirect("/auth/signin");
	}

	const isAdmin = await isSuperAdmin();
	
	// Use different layout based on user role
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<div className="space-y-6">
				<Suspense fallback={
					<Card>
						<CardContent className="flex items-center justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin" />
						</CardContent>
					</Card>
				}>
					<ProfileForm />
				</Suspense>
			</div>
		</Layout>
	);
}
