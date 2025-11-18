import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PayPalSubscriptionPage } from "@/components/paypal/paypal-subscription-page";

export const runtime = "edge";

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

	return (
		<DashboardLayout user={session.user}>
			<PayPalSubscriptionPage />
		</DashboardLayout>
	);
}
