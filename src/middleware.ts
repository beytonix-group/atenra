import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";

export default async function middleware(request: NextRequest) {
	const session = await auth();
	const pathname = request.nextUrl.pathname;

	// Public routes that don't need authentication
	const publicRoutes = ["/", "/login", "/register", "/pricing", "/about", "/social", "/more", "/contact"];

	// Shared authenticated routes (all logged-in users can access)
	const sharedAuthRoutes = ["/profile", "/marketplace", "/preferences"];

	// Admin-only routes
	const adminOnlyRoutes = [
		"/admindashboard",
		"/admindashboard/analytics",
		"/admindashboard/products",
		"/admindashboard/billing",
		"/admindashboard/reports",
		"/admindashboard/settings",
		"/admindashboard/support"
	];

	// Check if user is authenticated
	const isAuthenticated = !!session?.user;
	
	// Get user role from session or database
	let isAdmin = false;
	if (isAuthenticated && session?.user?.email) {
		try {
			// Check if user is super admin
			const response = await fetch(`${request.nextUrl.origin}/api/admin/check`, {
				headers: {
					cookie: request.headers.get("cookie") || "",
				},
			});
			if (response.ok) {
				const data = await response.json() as { isAdmin: boolean };
				isAdmin = data.isAdmin;
			}
		} catch (error) {
			console.error("Failed to check admin status:", error);
		}
	}

	// Handle authentication redirects
	if (!isAuthenticated) {
		// Redirect to login if trying to access protected routes
		if (sharedAuthRoutes.some(route => pathname.startsWith(route)) || 
		    adminOnlyRoutes.some(route => pathname.startsWith(route))) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	} else {
		// User is authenticated

		// Check if non-admin user needs to set preferences (skip for /preferences page itself)
		if (!isAdmin && pathname !== "/preferences") {
			try {
				const prefsResponse = await fetch(`${request.nextUrl.origin}/api/user/preferences`, {
					headers: {
						cookie: request.headers.get("cookie") || "",
					},
				});

				if (prefsResponse.ok) {
					const prefsData = await prefsResponse.json() as { hasPreferences: boolean };
					if (!prefsData.hasPreferences) {
						// Redirect to preferences page if user hasn't set preferences
						return NextResponse.redirect(new URL("/preferences", request.url));
					}
				}
			} catch (error) {
				console.error("Failed to check user preferences:", error);
			}
		}

		// Handle root redirect based on role
		if (pathname === "/" || pathname === "/dashboard") {
			if (isAdmin) {
				return NextResponse.redirect(new URL("/admindashboard", request.url));
			} else {
				return NextResponse.redirect(new URL("/marketplace", request.url));
			}
		}
		
		// Protect admin-only routes
		if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
			if (!isAdmin) {
				// Redirect non-admin users to marketplace
				return NextResponse.redirect(new URL("/marketplace", request.url));
			}
		}
		
		// Handle shared routes with proper navigation
		if (pathname === "/profile") {
			// Profile is accessible to all authenticated users
			// The profile page will determine which layout to use based on user role
			return NextResponse.next();
		}
		
		if (pathname === "/marketplace") {
			// Marketplace is accessible to all authenticated users
			// The marketplace page will determine which layout to use based on user role
			return NextResponse.next();
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
	],
};