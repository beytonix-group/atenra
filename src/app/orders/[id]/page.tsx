import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { OrderDetailContent } from "@/components/orders/OrderDetailContent";

interface PageParams {
	id: string;
}

export default async function OrderDetailPage({
	params,
}: {
	params: Promise<PageParams>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const { id } = await params;
	const isAdmin = await isSuperAdmin();
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<OrderDetailContent orderId={id} />
		</Layout>
	);
}
