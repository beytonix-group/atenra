import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { PaywallGuard } from "@/components/auth/PaywallGuard";
import { isSuperAdmin, hasCompanyAccess, hasCompanyManagementAccess, getUserOwnedCompanies } from "@/lib/auth-helpers";
import { fetchCompanyById, fetchCompanyEmployees } from "../actions";
import { CompanyDetailContent } from "@/components/marketplace/CompanyDetailContent";


export default async function CompanyDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const { id } = await params;
	const companyId = Number(id);
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

	// Use different layout based on user role
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	// Fetch company details
	const company = await fetchCompanyById(companyId);

	if (!company) {
		notFound();
	}

	// Check if user has access to view this company's employee section
	const canViewEmployees = await hasCompanyAccess(companyId);

	// Check if user has management access (can add/remove employees)
	const canManageEmployees = await hasCompanyManagementAccess(companyId);

	// Fetch company employees only if user has access
	const employees = canViewEmployees ? await fetchCompanyEmployees(companyId) : [];

	const content = (
		<Layout user={session.user} ownedCompanies={ownedCompanies}>
			<CompanyDetailContent
				company={company}
				employees={employees}
				isAdmin={isAdmin}
				canViewEmployees={canViewEmployees}
				canManageEmployees={canManageEmployees}
			/>
		</Layout>
	);

	// Admin users bypass paywall, regular users go through PaywallGuard
	if (isAdmin) {
		return content;
	}

	return <PaywallGuard>{content}</PaywallGuard>;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const company = await fetchCompanyById(Number(id));

	if (!company) {
		return {
			title: "Company Not Found - Atenra",
		};
	}

	return {
		title: `${company.name} - Marketplace - Atenra`,
		description: company.description || `View details about ${company.name}`,
	};
}