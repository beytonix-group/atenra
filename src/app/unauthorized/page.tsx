import { Navigation } from "@/components/landing/Navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldOff, Home, ArrowLeft, Lock } from "lucide-react";

export const runtime = "edge";

export const metadata = {
	title: "403 - Unauthorized | Atenra",
	description: "You don't have permission to access this resource.",
};

export default function UnauthorizedPage() {
	return (
		<main className="min-h-screen bg-background">
			<Navigation />
			<div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
				<div className="max-w-2xl mx-auto text-center space-y-8">
					{/* Icon */}
					<div className="flex justify-center">
						<div className="relative">
							<div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
							<div className="relative bg-red-50 dark:bg-red-950/20 p-6 rounded-full">
								<ShieldOff className="h-16 w-16 text-red-500" />
							</div>
						</div>
					</div>

					{/* Error Code */}
					<div className="space-y-4">
						<h1 className="text-7xl font-light text-foreground">403</h1>
						<h2 className="text-2xl md:text-3xl font-medium">Access Denied</h2>
						<p className="text-muted-foreground text-lg max-w-md mx-auto">
							You don&apos;t have the necessary permissions to view this page. This area requires special authorization.
						</p>
					</div>

					{/* Additional Info */}
					<div className="bg-muted/30 rounded-lg p-6 max-w-md mx-auto">
						<div className="flex items-start gap-3">
							<Lock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
							<div className="text-left">
								<p className="text-sm text-muted-foreground">
									If you believe you should have access to this resource, please contact your administrator or try signing in with an account that has the appropriate permissions.
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							variant="outline"
							size="lg"
							onClick={() => window.history.back()}
							className="group"
						>
							<ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
							Go Back
						</Button>
						<Link href="/">
							<Button size="lg" className="w-full sm:w-auto">
								<Home className="mr-2 h-4 w-4" />
								Return Home
							</Button>
						</Link>
					</div>

					{/* Help Text */}
					<p className="text-xs text-muted-foreground">
						Error Code: 403 · Need help?{" "}
						<Link href="/contact" className="underline hover:text-foreground transition-colors">
							Contact Support
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}