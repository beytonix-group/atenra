import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";

export default async function middleware(request: NextRequest) {
	const session = await auth();
	const pathname = request.nextUrl.pathname;

	// Shared authenticated routes (all logged-in users can access)
	const sharedAuthRoutes = ["/profile", "/marketplace", "/preferences"];

	// Admin-only routes - auth check handled by page components, not middleware
	// This avoids self-referencing fetch issues on Cloudflare Workers
	const adminOnlyRoutes = [
		"/admindashboard",
		"/admin"
	];

	// Check if user is authenticated
	const isAuthenticated = !!session?.user;

	// Handle authentication redirects
	if (!isAuthenticated) {
		// Redirect to login if trying to access protected routes
		if (sharedAuthRoutes.some(route => pathname.startsWith(route)) ||
		    adminOnlyRoutes.some(route => pathname.startsWith(route))) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	} else {
		// User is authenticated

		// Redirect authenticated users from root/dashboard to marketplace
		// Admin users will be redirected to admindashboard by the page component
		if (pathname === "/" || pathname === "/dashboard") {
			return NextResponse.redirect(new URL("/marketplace", request.url));
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