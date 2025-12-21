import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { UpgradeContent } from "@/components/upgrade/UpgradeContent";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { isSuperAdmin, getUserOwnedCompanies } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { users, subscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";


export default async function UpgradePage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	// Check if user has an active subscription (not in paywall flow)
	let hasActiveSubscription = false;
	const isAdmin = await isSuperAdmin().catch((error) => {
		console.error("Error checking admin status:", error);
		return false;
	});

	if (session.user.id) {
		try {
			const user = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.authUserId, session.user.id))
				.get();

			if (user) {
				const activeSubscription = await db
					.select({ status: subscriptions.status })
					.from(subscriptions)
					.where(eq(subscriptions.userId, user.id))
					.all();

				hasActiveSubscription = activeSubscription.some(
					s => s.status === 'active' || s.status === 'trialing'
				);
			}
		} catch (error) {
			console.error("Error checking subscription:", error);
		}
	}

	// Paywall flow: minimal layout without navigation
	if (!hasActiveSubscription && !isAdmin) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header with logout option */}
				<div className="border-b border-border">
					<div className="container mx-auto px-4 py-4 flex justify-between items-center">
						<span className="text-lg font-semibold">Atenra</span>
						<SignOutButton className="text-sm text-muted-foreground hover:text-foreground transition-colors" />
					</div>
				</div>
				<div className="container mx-auto px-4 py-8">
					<UpgradeContent isOnboarding />
				</div>
			</div>
		);
	}

	// Existing subscriber or admin: full dashboard layout
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;
	let ownedCompanies: Awaited<ReturnType<typeof getUserOwnedCompanies>> = [];
	try {
		ownedCompanies = await getUserOwnedCompanies();
	} catch (error) {
		console.error("Error fetching owned companies:", error);
	}

	return (
		<Layout user={session.user} ownedCompanies={ownedCompanies}>
			<UpgradeContent />
		</Layout>
	);
}
