import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles, companyUsers } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function checkSuperAdmin() {
	const session = await auth();
	
	if (!session?.user?.id) {
		return { 
			isAuthorized: false, 
			error: "Not authenticated",
			response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		};
	}

	try {
		// Get user from database
		const user = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, session.user.id))
			.get();

		if (!user) {
			return { 
				isAuthorized: false, 
				error: "User not found",
				response: NextResponse.json({ error: "User not found" }, { status: 404 })
			};
		}

		// Check if user has super_admin role
		const userRole = await db
			.select({
				roleName: roles.name
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, user.id))
			.get();

		if (userRole?.roleName !== 'super_admin') {
			return { 
				isAuthorized: false, 
				error: "Insufficient permissions",
				response: NextResponse.json({ error: "Forbidden - Super Admin access required" }, { status: 403 })
			};
		}

		return { 
			isAuthorized: true, 
			user,
			response: null 
		};
	} catch (error) {
		console.error("Error checking super admin status:", error);
		return { 
			isAuthorized: false, 
			error: "Internal server error",
			response: NextResponse.json({ error: "Internal server error" }, { status: 500 })
		};
	}
}

export async function getUserRole(authUserId: string): Promise<string | null> {
	try {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, authUserId))
			.get();

		if (!user) return null;

		const userRole = await db
			.select({
				roleName: roles.name
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, user.id))
			.get();

		return userRole?.roleName || null;
	} catch (error) {
		console.error("Error getting user role:", error);
		return null;
	}
}

export async function isSuperAdmin(): Promise<boolean> {
	const session = await auth();

	if (!session?.user?.id) {
		return false;
	}

	const role = await getUserRole(session.user.id);
	return role === 'super_admin';
}

/**
 * Check if the current user has access to view a company's details
 * (super admin or associated with the company)
 */
export async function hasCompanyAccess(companyId: number): Promise<boolean> {
	const session = await auth();

	if (!session?.user?.id) {
		return false;
	}

	// Super admins have access to all companies
	if (await isSuperAdmin()) {
		return true;
	}

	// Check if user is associated with the company
	const user = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, session.user.id))
		.get();

	if (!user) {
		return false;
	}

	const association = await db
		.select()
		.from(companyUsers)
		.where(
			and(
				eq(companyUsers.companyId, companyId),
				eq(companyUsers.userId, user.id)
			)
		)
		.get();

	return !!association;
}

/**
 * Check if the current user has management privileges for a company
 * (super admin, owner, or manager)
 */
export async function hasCompanyManagementAccess(companyId: number): Promise<boolean> {
	const session = await auth();

	if (!session?.user?.id) {
		return false;
	}

	// Super admins have management access to all companies
	if (await isSuperAdmin()) {
		return true;
	}

	// Check if user is owner or manager of the company
	const user = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, session.user.id))
		.get();

	if (!user) {
		return false;
	}

	const association = await db
		.select()
		.from(companyUsers)
		.where(
			and(
				eq(companyUsers.companyId, companyId),
				eq(companyUsers.userId, user.id)
			)
		)
		.get();

	if (!association) {
		return false;
	}

	// Check if role is owner or manager
	return association.role === 'owner' || association.role === 'manager';
}

/**
 * Get the current user's company role for a specific company
 */
export async function getUserCompanyRole(companyId: number): Promise<'owner' | 'manager' | 'staff' | null> {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	const user = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, session.user.id))
		.get();

	if (!user) {
		return null;
	}

	const association = await db
		.select()
		.from(companyUsers)
		.where(
			and(
				eq(companyUsers.companyId, companyId),
				eq(companyUsers.userId, user.id)
			)
		)
		.get();

	return association?.role || null;
}

/**
 * Get the current authenticated user from the database
 * Returns the full user object or null if not authenticated
 */
export async function getCurrentUser() {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	const user = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, session.user.id))
		.get();

	return user || null;
}