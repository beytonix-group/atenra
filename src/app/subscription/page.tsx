import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { BillingContent } from "@/components/billing/BillingContent";
import { isSuperAdmin } from "@/lib/auth-helpers";


export default async function BillingPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const isAdmin = await isSuperAdmin();
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<BillingContent />
		</Layout>
	);
}
