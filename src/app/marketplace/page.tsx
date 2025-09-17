import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";
import { isSuperAdmin } from "@/lib/auth-helpers";

export const runtime = "edge";

export const metadata = {
	title: "Marketplace - Atenra",
	description: "Browse and discover products and services.",
};

export default async function MarketplacePage() {
	const session = await auth();
	
	if (!session?.user) {
		redirect("/auth/signin");
	}

	const isAdmin = await isSuperAdmin();
	
	// Use different layout based on user role
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<MarketplaceContent />
		</Layout>
	);
}