import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BillingContent } from "@/components/billing/BillingContent";


export default async function BillingPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<DashboardLayout user={session.user}>
			<BillingContent />
		</DashboardLayout>
	);
}
