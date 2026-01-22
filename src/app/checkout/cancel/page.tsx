import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserDashboardLayout } from "@/components/dashboard/UserDashboardLayout";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isSuperAdmin } from "@/lib/auth-helpers";

export default async function CheckoutCancelPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	const isAdmin = await isSuperAdmin();
	const Layout = isAdmin ? DashboardLayout : UserDashboardLayout;

	return (
		<Layout user={session.user}>
			<div className="max-w-2xl mx-auto py-16 px-4">
				<div className="text-center space-y-6">
					{/* Cancel Icon */}
					<div className="flex justify-center">
						<div className="rounded-full bg-orange-100 p-6">
							<XCircle className="h-16 w-16 text-orange-600" />
						</div>
					</div>

					{/* Cancel Message */}
					<div className="space-y-2">
						<h1 className="text-3xl font-bold">Checkout Cancelled</h1>
						<p className="text-lg text-muted-foreground">
							Your payment was not processed. No charges were made to your account.
						</p>
					</div>

					{/* Information */}
					<div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
						<h2 className="font-semibold text-lg">What happened?</h2>
						<p className="text-sm text-muted-foreground">
							You cancelled the checkout process or closed the payment window before completing your purchase.
							This is completely normal, and you can try again whenever you&apos;re ready.
						</p>
					</div>

					{/* Help Section */}
					<div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
						<h2 className="font-semibold text-lg">Your items are still in your cart</h2>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<span className="text-primary mt-1">•</span>
								<span>Your cart items have been saved</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary mt-1">•</span>
								<span>You can return to checkout at any time</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary mt-1">•</span>
								<span>If you experienced an error, please try again or contact support</span>
							</li>
						</ul>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						<Button asChild>
							<Link href="/cart">
								<ShoppingCart className="mr-2 h-4 w-4" />
								Return to Cart
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/marketplace">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Continue Shopping
							</Link>
						</Button>
					</div>

					{/* Contact Support */}
					<div className="pt-4 border-t">
						<p className="text-sm text-muted-foreground">
							Having trouble?{" "}
							<Link href="/support" className="text-primary hover:underline">
								Contact our support team
							</Link>
						</p>
					</div>
				</div>
			</div>
		</Layout>
	);
}
