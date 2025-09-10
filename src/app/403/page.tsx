"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Home, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
			<div className="max-w-md w-full p-8 text-center space-y-6">
				<div className="flex justify-center">
					<div className="relative">
						<Shield className="h-24 w-24 text-red-500 opacity-20" />
						<Shield className="h-24 w-24 text-red-500 absolute top-0 left-0 animate-pulse" />
					</div>
				</div>
				
				<div className="space-y-2">
					<h1 className="text-4xl font-bold text-foreground">403</h1>
					<h2 className="text-2xl font-semibold text-foreground">Access Forbidden</h2>
					<p className="text-muted-foreground">
						You don't have permission to access this resource. This area is restricted to administrators only.
					</p>
				</div>

				<div className="space-y-3">
					<Link href="/">
						<Button variant="default" className="w-full">
							<Home className="mr-2 h-4 w-4" />
							Go to Homepage
						</Button>
					</Link>
					
					<Button 
						variant="outline" 
						className="w-full"
						onClick={() => window.history.back()}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Go Back
					</Button>
				</div>

				<div className="pt-4 border-t border-border">
					<p className="text-sm text-muted-foreground">
						If you believe you should have access to this page, please contact your system administrator.
					</p>
				</div>
			</div>
		</div>
	);
}