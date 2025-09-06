import { requireRole } from "@/lib/auth/permissions";
import { Navigation } from "@/components/landing/Navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ROLES } from "@/lib/auth/roles";

export const runtime = "edge";

export const metadata = {
	title: "Admin Dashboard - Atenra",
	description: "System administration dashboard for managing users and permissions.",
};

export default async function AdminPage() {
	// This will redirect to /unauthorized if user doesn't have super_admin role
	await requireRole(ROLES.SUPER_ADMIN);

	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-8">
				<AdminDashboard />
			</div>
		</main>
	);
}