import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getUserOwnedCompanies } from "@/lib/auth-helpers";


export const metadata = {
	title: "Profile - Atenra",
	description: "Manage your account settings and preferences.",
};

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	let ownedCompanies: Awaited<ReturnType<typeof getUserOwnedCompanies>> = [];
	try {
		ownedCompanies = await getUserOwnedCompanies();
	} catch (error) {
		console.error("Failed to fetch owned companies:", error);
	}

	return (
		<DashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
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
		</DashboardLayout>
	);
}