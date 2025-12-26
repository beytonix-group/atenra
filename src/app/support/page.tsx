import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { SupportPageContent } from "@/components/support/SupportPageContent";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getUserOwnedCompanies } from "@/lib/auth-helpers";

export default async function SupportPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const ownedCompanies = await getUserOwnedCompanies();

	return (
		<DashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
			<SupportPageContent />
		</DashboardLayout>
	);
}
