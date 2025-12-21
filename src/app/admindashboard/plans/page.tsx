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

	if (!isAdmin) {
		redirect("/403");
	}

	return (
		<DashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
			<PlansManagement />
		</DashboardLayout>
	);
}
