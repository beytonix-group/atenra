import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { isSuperAdmin } from "@/lib/auth-helpers";

export default async function CheckoutPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const isAdmin = await isSuperAdmin();
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<CheckoutContent />
		</Layout>
	);
}
