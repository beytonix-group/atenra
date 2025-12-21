import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PaywallGuard } from "@/components/auth/PaywallGuard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { isSuperAdmin, getUserOwnedCompanies } from "@/lib/auth-helpers";


export const metadata = {
	title: "Profile - Atenra",
	description: "Manage your account settings and preferences.",
};

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const [isAdmin, ownedCompanies] = await Promise.all([
		isSuperAdmin().catch((error) => {
			console.error("Error checking admin status:", error);
			return false;
		}),
		getUserOwnedCompanies().catch((error) => {
			console.error("Error fetching owned companies:", error);
			return [];
		})
	]);

	// Use different layout based on user role
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	const content = (
		<Layout user={session.user} ownedCompanies={ownedCompanies}>
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

	// Admin users bypass paywall, regular users go through PaywallGuard
	if (isAdmin) {
		return content;
	}

	return <PaywallGuard>{content}</PaywallGuard>;
}
