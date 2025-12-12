import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { MarketplaceContent } from "@/components/marketplace/MarketplaceContent";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { fetchCompanies, fetchServiceCategories } from "./actions";
import { db } from "@/server/db";
import { users, userServicePreferences } from "@/server/db/schema";
import { eq, asc } from "drizzle-orm";


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
	searchParams: Promise<SearchParams>
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const resolvedSearchParams = await searchParams;
	const isAdmin = await isSuperAdmin();

	// Use different layout based on user role
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	// Get user preferences for default filtering (only for non-admin users)
	// Only apply preferences if category param is not in URL at all
	// Note: Paywall/preferences redirect is handled by middleware
	let defaultCategoryId: number | undefined = undefined;
	let isUsingPreferences = false;

	if (!isAdmin && session.user.id) {
		try {
			// Get user's database ID
			const user = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.authUserId, session.user.id))
				.get();

			if (user) {
				// Get user's top preference for default filtering (if no category in URL)
				if (!('category' in resolvedSearchParams)) {
					const topPreference = await db
						.select({ categoryId: userServicePreferences.categoryId })
						.from(userServicePreferences)
						.where(eq(userServicePreferences.userId, user.id))
						.orderBy(asc(userServicePreferences.priority))
						.limit(1)
						.get();

					if (topPreference) {
						defaultCategoryId = topPreference.categoryId;
						isUsingPreferences = true;
					}
				}
			}
		} catch (error) {
			console.error("Failed to fetch user preferences:", error);
			// Continue without preferences if there's an error
		}
	}

	// Parse search params
	const page = Number(resolvedSearchParams.page) || 1;
	const limit = Number(resolvedSearchParams.limit) || 25;
	// Use category from URL if present (even if empty string), otherwise use preference
	const categoryId = 'category' in resolvedSearchParams && resolvedSearchParams.category
		? Number(resolvedSearchParams.category)
		: defaultCategoryId;
	const sortBy = (resolvedSearchParams.sort || 'createdAt') as 'name' | 'createdAt';
	const search = resolvedSearchParams.search || '';

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
				isUsingPreferences={isUsingPreferences}
				defaultCategoryId={categoryId}
				isAdmin={isAdmin}
			/>
		</Layout>
	);
}