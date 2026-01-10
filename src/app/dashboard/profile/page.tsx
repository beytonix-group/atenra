import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
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

	const [isAdminResult, ownedCompaniesResult] = await Promise.allSettled([
		isSuperAdmin(),
		getUserOwnedCompanies()
	]);

	const isAdmin = isAdminResult.status === 'fulfilled' ? isAdminResult.value : false;
	const ownedCompanies = ownedCompaniesResult.status === 'fulfilled' ? ownedCompaniesResult.value : [];

	if (isAdminResult.status === 'rejected') {
		console.error("Failed to check admin status:", isAdminResult.reason);
	}
	if (ownedCompaniesResult.status === 'rejected') {
		console.error("Failed to fetch owned companies:", ownedCompaniesResult.reason);
	}

	// If user is admin, redirect to admin profile
	if (isAdmin) {
		redirect("/admindashboard/profile");
	}

	return (
		<UserDashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
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
		</UserDashboardLayout>
	);
}
