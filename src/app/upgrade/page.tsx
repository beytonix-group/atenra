import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UpgradeContent } from "@/components/upgrade/UpgradeContent";


export default async function UpgradePage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<DashboardLayout user={session.user}>
			<UpgradeContent />
		</DashboardLayout>
	);
}
