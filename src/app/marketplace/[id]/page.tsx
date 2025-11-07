import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { fetchCompanyById, fetchCompanyEmployees } from "../actions";
import { CompanyDetailContent } from "@/components/marketplace/CompanyDetailContent";

export const runtime = "edge";

export default async function CompanyDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const isAdmin = await isSuperAdmin();

	// Use different layout based on user role
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	// Fetch company details
	const company = await fetchCompanyById(Number(params.id));

	if (!company) {
		notFound();
	}

	// Fetch company employees
	const employees = await fetchCompanyEmployees(Number(params.id));

	return (
		<Layout user={session.user}>
			<CompanyDetailContent company={company} employees={employees} isAdmin={isAdmin} />
		</Layout>
	);
}

export async function generateMetadata({
	params,
}: {
	params: { id: string };
}) {
	const company = await fetchCompanyById(Number(params.id));

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