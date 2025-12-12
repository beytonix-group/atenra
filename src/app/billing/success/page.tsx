import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isSuperAdmin } from "@/lib/auth-helpers";


interface SearchParams {
	session_id?: string;
}

export default async function BillingSuccessPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const resolvedSearchParams = await searchParams;
	const sessionId = resolvedSearchParams.session_id;

	const isAdmin = await isSuperAdmin();
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<div className="max-w-2xl mx-auto py-16 px-4">
				<div className="text-center space-y-6">
					{/* Success Icon */}
					<div className="flex justify-center">
						<div className="rounded-full bg-green-100 p-6">
							<CheckCircle className="h-16 w-16 text-green-600" />
						</div>
					</div>

					{/* Success Message */}
					<div className="space-y-2">
						<h1 className="text-3xl font-bold">Payment Successful!</h1>
						<p className="text-lg text-muted-foreground">
							Thank you for subscribing. Your payment has been processed successfully.
						</p>
					</div>

					{/* Details */}
					<div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
						<h2 className="font-semibold text-lg">What happens next?</h2>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<span className="text-primary mt-1">•</span>
								<span>Your subscription is now active and ready to use</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary mt-1">•</span>
								<span>You will receive a confirmation email with your receipt</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary mt-1">•</span>
								<span>You can manage your subscription anytime from the billing page</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary mt-1">•</span>
								<span>Your card will be charged automatically each billing cycle</span>
							</li>
						</ul>
					</div>

					{sessionId && (
						<div className="text-xs text-muted-foreground">
							Session ID: {sessionId}
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						<Button asChild>
							<Link href="/marketplace">
								Go to Marketplace
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/billing">View Billing Details</Link>
						</Button>
					</div>
				</div>
			</div>
		</Layout>
	);
}
