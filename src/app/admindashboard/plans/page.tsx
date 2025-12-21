import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PlansManagement } from "@/components/admin/PlansManagement";
import { isSuperAdmin, getUserOwnedCompanies } from "@/lib/auth-helpers";


export default async function PlansPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const [isAdmin, ownedCompanies] = await Promise.all([
		isSuperAdmin(),
		getUserOwnedCompanies()
	]);

	if (!isAdmin) {
		redirect("/403");
	}

	return (
		<DashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
			<PlansManagement />
		</DashboardLayout>
	);
}
