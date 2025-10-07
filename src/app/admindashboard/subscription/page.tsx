import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";

export const runtime = "edge";

export default async function SubscriptionPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<DashboardLayout user={session.user}>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
					<p className="text-muted-foreground">View your current plan and explore available options</p>
				</div>

				<SubscriptionManager />
			</div>
		</DashboardLayout>
	);
}
