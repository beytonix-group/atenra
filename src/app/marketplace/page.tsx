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
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
				<div className="max-w-md space-y-4">
					<h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
					<div className="text-6xl">🚧</div>
					<p className="text-lg text-muted-foreground">
						This page is currently under development.
					</p>
					<p className="text-sm text-muted-foreground">
						Coming soon! We're working hard to bring you an amazing marketplace experience.
					</p>
				</div>
			</div>
		</Layout>
	);
}