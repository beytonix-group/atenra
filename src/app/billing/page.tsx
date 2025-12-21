import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { BillingContent } from "@/components/billing/BillingContent";
import { isSuperAdmin, getUserOwnedCompanies } from "@/lib/auth-helpers";


export default async function BillingPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
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
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user} ownedCompanies={ownedCompanies}>
			<div className="container mx-auto py-8">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Billing & Invoices</h1>
					<p className="text-muted-foreground mt-2">
						Manage your subscription, payment methods, and view invoices
					</p>
				</div>
				<BillingContent />
			</div>
		</Layout>
	);
}
