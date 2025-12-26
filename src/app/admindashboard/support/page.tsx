import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { canManageSupportTickets, getUserOwnedCompanies } from "@/lib/auth-helpers";
import { AdminSupportContent } from "@/components/admin/support/AdminSupportContent";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default async function AdminSupportPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const [hasAccess, ownedCompanies] = await Promise.all([
		canManageSupportTickets(),
		getUserOwnedCompanies(),
	]);

	if (!hasAccess) {
		redirect("/admindashboard");
	}

	return (
		<DashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
			<AdminSupportContent />
		</DashboardLayout>
	);
}
