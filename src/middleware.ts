import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";

// All routes that require authentication
const protectedRoutes = [
	"/profile",
	"/marketplace",
	"/preferences",
	"/upgrade",
	"/billing",
	"/admindashboard",
	"/admin",
	"/chat",
	"/messages",
];

export default async function middleware(request: NextRequest) {
	const session = await auth();
	const pathname = request.nextUrl.pathname;

	const isAuthenticated = !!session?.user;

	// Handle unauthenticated users
	if (!isAuthenticated) {
		if (protectedRoutes.some(route => pathname.startsWith(route))) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
		return NextResponse.next();
	}

	// User is authenticated - handle root/dashboard redirect
	if (pathname === "/" || pathname === "/dashboard") {
		return NextResponse.redirect(new URL("/marketplace", request.url));
	}

	// All other checks (paywall, roles) are handled by PaywallGuard in page layouts
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