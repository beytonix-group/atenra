"use client";

import { Button } from "@/components/ui/button";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface UnauthorizedAccessProps {
	message?: string;
	requiredRole?: string;
}

export function UnauthorizedAccess({ 
	message = "You don't have permission to access this resource.",
	requiredRole
}: UnauthorizedAccessProps) {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] px-4 py-12">
			<div className="max-w-md mx-auto text-center space-y-6">
				{/* Icon */}
				<div className="flex justify-center">
					<div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-full">
						<ShieldOff className="h-12 w-12 text-red-500" />
					</div>
				</div>

				{/* Message */}
				<div className="space-y-2">
					<h2 className="text-2xl font-medium">Access Restricted</h2>
					<p className="text-muted-foreground">{message}</p>
					{requiredRole && (
						<p className="text-sm text-muted-foreground">
							Required role: <span className="font-medium">{requiredRole}</span>
						</p>
					)}
				</div>

				{/* Action Button */}
				<Button
					variant="outline"
					onClick={() => router.back()}
					className="group"
				>
					<ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
					Go Back
				</Button>
			</div>
		</div>
	);
}