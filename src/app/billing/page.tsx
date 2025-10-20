import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BillingContent } from "@/components/billing/BillingContent";

export const runtime = "edge";

export default async function BillingPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<DashboardLayout user={session.user}>
			<div className="container mx-auto py-8">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Billing & Invoices</h1>
					<p className="text-muted-foreground mt-2">
						Manage your subscription, payment methods, and view invoices
					</p>
				</div>
				<BillingContent />
			</div>
		</DashboardLayout>
	);
}
