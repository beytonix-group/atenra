import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { hasCompanyAccess } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { companies } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { CompanyDashboardLayout } from "@/components/company-dashboard/CompanyDashboardLayout";

interface CompanyLayoutProps {
	children: React.ReactNode;
	params: Promise<{ companyId: string }>;
}

export default async function CompanyLayout({
	children,
	params,
}: CompanyLayoutProps) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const { companyId } = await params;
	const companyIdNum = parseInt(companyId);

	if (isNaN(companyIdNum)) {
		redirect("/marketplace");
	}

	// Check access
	const hasAccess = await hasCompanyAccess(companyIdNum);
	if (!hasAccess) {
		redirect("/marketplace");
	}

	// Get company info
	const company = await db
		.select()
		.from(companies)
		.where(eq(companies.id, companyIdNum))
		.get();

	if (!company) {
		redirect("/marketplace");
	}

	return (
		<CompanyDashboardLayout
			company={company}
			user={{
				name: session.user.name,
				email: session.user.email,
				image: session.user.image,
			}}
		>
			{children}
		</CompanyDashboardLayout>
	);
}
