import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { PayPalSubscriptionPage } from "@/components/paypal/paypal-subscription-page";
import { isSuperAdmin } from "@/lib/auth-helpers";


/**
 * PayPal Subscription Page
 *
 * Allows users to subscribe using PayPal monthly billing.
 * Shows current subscription status and PayPal subscription button.
 *
 * Route: /subscription/paypal
 */
export default async function PayPalSubscription() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const isAdmin = await isSuperAdmin();
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<PayPalSubscriptionPage />
		</Layout>
	);
}
