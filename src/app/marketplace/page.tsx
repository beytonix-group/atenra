import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { fetchCompanies, fetchServiceCategories } from "./actions";

export const runtime = "edge";

export const metadata = {
	title: "Marketplace - Atenra",
	description: "Browse and discover companies and services.",
};

interface SearchParams {
	page?: string;
	limit?: string;
	category?: string;
	sort?: string;
	search?: string;
}

export default async function MarketplacePage({
	searchParams
}: {
	searchParams: SearchParams
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const isAdmin = await isSuperAdmin();

	// Use different layout based on user role
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	// Parse search params
	const page = Number(searchParams.page) || 1;
	const limit = Number(searchParams.limit) || 25;
	const categoryId = searchParams.category ? Number(searchParams.category) : undefined;
	const sortBy = (searchParams.sort || 'createdAt') as 'name' | 'createdAt';
	const search = searchParams.search || '';

	// Fetch initial data
	const [companiesData, categories] = await Promise.all([
		fetchCompanies({
			page,
			limit,
			categoryId,
			sortBy,
			sortOrder: 'desc',
			search
		}),
		fetchServiceCategories()
	]);

	return (
		<Layout user={session.user}>
			<MarketplaceContent
				initialCompanies={companiesData.companies}
				initialCategories={categories}
				initialTotalPages={companiesData.totalPages}
			/>
		</Layout>
	);
}