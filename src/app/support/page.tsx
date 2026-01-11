import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { SupportPageContent } from "@/components/support/SupportPageContent";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { getUserOwnedCompanies } from "@/lib/auth-helpers";

export default async function SupportPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const ownedCompanies = await getUserOwnedCompanies();

	return (
		<UserDashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
			<SupportPageContent />
		</UserDashboardLayout>
	);
}
