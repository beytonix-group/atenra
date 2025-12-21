import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getUserOwnedCompanies, isSuperAdmin } from "@/lib/auth-helpers";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CompanySelectPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	let ownedCompanies: Awaited<ReturnType<typeof getUserOwnedCompanies>> = [];
	try {
		ownedCompanies = await getUserOwnedCompanies();
	} catch (error) {
		console.error("Error fetching owned companies:", error);
	}

	// If no owned companies, redirect to marketplace
	if (ownedCompanies.length === 0) {
		redirect("/marketplace");
	}

	// If only one company, redirect directly to its dashboard
	if (ownedCompanies.length === 1) {
		redirect(`/company/${ownedCompanies[0].id}`);
	}

	const isAdmin = await isSuperAdmin();
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user} ownedCompanies={ownedCompanies}>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Select Company</h1>
					<p className="text-muted-foreground mt-2">
						Choose which company dashboard you want to access
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{ownedCompanies.map((company) => (
						<Link
							key={company.id}
							href={`/company/${company.id}`}
							className="block group"
						>
							<Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 group-hover:bg-accent/50">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
											<Building2 className="h-6 w-6 text-primary" />
										</div>
										<ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
									</div>
									<CardTitle className="mt-4 text-lg">{company.name}</CardTitle>
									{(company.city || company.state) && (
										<CardDescription className="flex items-center gap-1">
											<MapPin className="h-3 w-3" />
											{[company.city, company.state].filter(Boolean).join(", ")}
										</CardDescription>
									)}
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										View dashboard, manage jobs, and track revenue
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</Layout>
	);
}
