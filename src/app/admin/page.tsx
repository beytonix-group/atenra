import { Navigation } from "@/components/landing/Navigation";
import { FooterSection } from "@/components/landing/FooterSection";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const runtime = "edge";

export const metadata = {
	title: "Admin Dashboard - Atenra",
	description: "Admin panel for managing users and system settings.",
};

export default async function AdminPage() {
	const isAdmin = await isSuperAdmin();
	
	if (!isAdmin) {
		redirect("/");
	}

	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="pt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="mb-8">
						<h1 className="text-3xl font-bold">Admin Dashboard</h1>
						<p className="text-muted-foreground mt-2">
							Manage users, roles, and system settings
						</p>
					</div>
					
					<Suspense fallback={
						<div className="bg-card rounded-lg border p-8">
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin" />
							</div>
						</div>
					}>
						<AdminDashboard />
					</Suspense>
				</div>
				<FooterSection />
			</div>
		</main>
	);
}