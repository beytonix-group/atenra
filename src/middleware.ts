import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@/server/db/schema";
import { users, subscriptions, userRoles, roles, userServicePreferences } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Get database lazily during request handling (not at module load time)
// This is necessary for Cloudflare Workers middleware
function getDb() {
	const database = getCloudflareContext().env.DATABASE;
	return drizzle(database, { schema });
}

// Routes that don't require paywall check (even for authenticated users)
const paywallExemptRoutes = [
	"/preferences",
	"/upgrade",
	"/billing",
	"/login",
	"/register",
	"/auth",
	"/api",
	"/403",
	"/404",
];

// Admin-only routes - auth check handled by page components
const adminOnlyRoutes = [
	"/admindashboard",
	"/admin"
];

// All routes that require authentication
const protectedRoutes = [
	"/profile",
	"/marketplace",
	"/preferences",
	"/upgrade",
	"/billing",
	"/admindashboard",
	"/admin",
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

	// Skip paywall check for exempt routes
	if (paywallExemptRoutes.some(route => pathname.startsWith(route))) {
		return NextResponse.next();
	}

	// Paywall enforcement for non-exempt routes
	try {
		const authUserId = session.user?.id;
		if (!authUserId) {
			return NextResponse.next();
		}

		// Get database instance lazily (required for Cloudflare Workers)
		const db = getDb();

		// Get user from database
		const user = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.authUserId, authUserId))
			.get();

		if (!user) {
			// User not in database yet - let them proceed (will be created on page load)
			return NextResponse.next();
		}

		// Check if user is exempt from paywall (super_admin or employee)
		const userRole = await db
			.select({ roleName: roles.name })
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, user.id))
			.get();

		if (userRole?.roleName === 'super_admin' || userRole?.roleName === 'employee') {
			return NextResponse.next();
		}

		// Check if user has active subscription
		const activeSubscription = await db
			.select({ status: subscriptions.status })
			.from(subscriptions)
			.where(eq(subscriptions.userId, user.id))
			.limit(1)
			.get();

		const hasActivePlan = activeSubscription &&
			(activeSubscription.status === 'active' || activeSubscription.status === 'trialing');

		if (hasActivePlan) {
			return NextResponse.next();
		}

		// No active plan - check if user has preferences
		const hasPreferences = await db
			.select({ categoryId: userServicePreferences.categoryId })
			.from(userServicePreferences)
			.where(eq(userServicePreferences.userId, user.id))
			.limit(1)
			.get();

		if (!hasPreferences) {
			// No preferences - redirect to preferences page
			return NextResponse.redirect(new URL("/preferences", request.url));
		}

		// Has preferences but no plan - redirect to upgrade page
		return NextResponse.redirect(new URL("/upgrade", request.url));
	} catch (error) {
		// If DB check fails, let the request through
		// Page components will handle paywall as fallback
		console.error("Middleware paywall check error:", error);
		return NextResponse.next();
	}
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