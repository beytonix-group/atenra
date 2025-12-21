import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { isSuperAdmin, getUserOwnedCompanies } from "@/lib/auth-helpers";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateCompanyForm } from "@/components/company/CreateCompanyForm";
import { fetchServiceCategories } from "@/app/marketplace/actions";


export default async function CreateCompanyPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	// Check if user is super admin
	const [isAdminResult, ownedCompaniesResult] = await Promise.allSettled([
		isSuperAdmin(),
		getUserOwnedCompanies()
	]);

	const isAdmin = isAdminResult.status === 'fulfilled' ? isAdminResult.value : false;
	const ownedCompanies = ownedCompaniesResult.status === 'fulfilled' ? ownedCompaniesResult.value : [];

	if (isAdminResult.status === 'rejected') {
		console.error("Failed to check admin status:", isAdminResult.reason);
	}
	if (ownedCompaniesResult.status === 'rejected') {
		console.error("Failed to fetch owned companies:", ownedCompaniesResult.reason);
	}

	if (!isAdmin) {
		redirect("/403");
	}

	// Fetch service categories
	const categories = await fetchServiceCategories();

	return (
		<DashboardLayout user={session.user} ownedCompanies={ownedCompanies}>
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Create New Company</h1>
					<p className="text-muted-foreground mt-2">
						Add a new company to the marketplace
					</p>
				</div>

				<CreateCompanyForm categories={categories} />
			</div>
		</DashboardLayout>
	);
}
