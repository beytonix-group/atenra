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
	"/cart",
];

// Routes that regular users are blocked from accessing
const regularUserBlockedRoutes = [
	"/marketplace",
	"/admindashboard",
	"/admin",
	"/company",
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

	// User is authenticated - check roles for routing
	// Roles are cached in JWT token, so this is fast (no DB call)
	// Support both new 'roles' array and old 'role' string for backward compatibility
	const sessionUser = session.user as { roles?: string[] | null; role?: string | null };
	let userRoles = sessionUser?.roles;

	// Backward compatibility: convert old 'role' string to array if 'roles' is not set
	if (!userRoles && sessionUser?.role) {
		userRoles = [sessionUser.role];
	}

	// Regular user = no roles, or only has 'user' role
	const isRegularUser = !userRoles ||
		userRoles.length === 0 ||
		(userRoles.length === 1 && userRoles[0] === 'user');

	if (isRegularUser) {
		// Regular users are blocked from certain routes
		if (regularUserBlockedRoutes.some(route => pathname.startsWith(route))) {
			return NextResponse.redirect(new URL("/chat", request.url));
		}

		// Redirect regular users from root/dashboard to chat (not marketplace)
		if (pathname === "/" || pathname === "/dashboard") {
			return NextResponse.redirect(new URL("/chat", request.url));
		}
	} else {
		// Non-regular users (admin, manager, etc.) go to marketplace
		if (pathname === "/" || pathname === "/dashboard") {
			return NextResponse.redirect(new URL("/marketplace", request.url));
		}
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