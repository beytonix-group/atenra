import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { validateOrigin, getAllowedOrigins, isStateChangingMethod } from "@/lib/csrf";

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
	"/checkout",
	"/orders",
];

// Routes that regular users are blocked from accessing
const regularUserBlockedRoutes = [
	"/admindashboard",
	"/admin",
];

// API routes that require CSRF protection (state-changing operations)
const csrfProtectedApiRoutes = [
	"/api/admin",
	"/api/billing",
	"/api/cart",
	"/api/checkout",
	"/api/companies",
	"/api/messages",
	"/api/orders",
	"/api/profile",
	"/api/support",
	"/api/user",
];

export default async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// CSRF Protection: Validate Origin header for state-changing API requests
	if (pathname.startsWith('/api') && isStateChangingMethod(request.method)) {
		const isProtectedRoute = csrfProtectedApiRoutes.some(route =>
			pathname.startsWith(route)
		);

		if (isProtectedRoute) {
			const allowedOrigins = getAllowedOrigins();
			const originValidation = validateOrigin(request, allowedOrigins);

			if (!originValidation.valid) {
				console.warn('CSRF protection blocked request:', {
					path: pathname,
					method: request.method,
					error: originValidation.error,
				});
				return NextResponse.json(
					{ error: 'Invalid request origin' },
					{ status: 403 }
				);
			}
		}
	}

	const session = await auth();

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
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder files with extensions
		 *
		 * Note: API routes are now included for CSRF protection
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
	],
};