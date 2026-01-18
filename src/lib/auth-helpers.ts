import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles, companyUsers, companies, type Company } from "@/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Check if current user is super admin (for API routes)
 * Reads from session - no DB call required
 */
export async function checkSuperAdmin() {
	const session = await auth();

	if (!session?.user?.id) {
		return {
			isAuthorized: false,
			error: "Not authenticated",
			response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		};
	}

	// Read roles from session (no DB call - roles are cached in JWT)
	// Support backward compatibility with old 'role' string format
	let roles = session.user.roles;
	if (!roles) {
		const oldRole = (session.user as { role?: string | null })?.role;
		if (oldRole) roles = [oldRole];
	}

	if (!roles || !roles.includes('super_admin')) {
		return {
			isAuthorized: false,
			error: "Insufficient permissions",
			response: NextResponse.json({ error: "Forbidden - Super Admin access required" }, { status: 403 })
		};
	}

	return {
		isAuthorized: true,
		response: null
	};
}

/**
 * Fetch all user roles from database by authUserId
 * Use this only when you need to query DB directly (e.g., for users other than current user)
 * Returns an array of role names (e.g., ['super_admin', 'manager'])
 */
export async function getUserRolesFromDb(authUserId: string): Promise<string[] | null> {
	try {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.authUserId, authUserId))
			.get();

		if (!user) return null;

		const userRolesList = await db
			.select({
				roleName: roles.name
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, user.id))
			.all();

		if (userRolesList.length === 0) return null;
		return userRolesList.map(r => r.roleName);
	} catch (error) {
		console.error("Error getting user roles:", error);
		return null;
	}
}

/**
 * Get current user's roles from session (no DB call - reads from JWT)
 * Returns an array of role names or null if no roles
 * Supports backward compatibility with old 'role' string format
 */
export async function getUserRoles(): Promise<string[] | null> {
	const session = await auth();
	const roles = session?.user?.roles;
	if (roles) return roles;

	// Backward compatibility: convert old 'role' string to array
	const oldRole = (session?.user as { role?: string | null })?.role;
	if (oldRole) return [oldRole];

	return null;
}

/**
 * Check if current user has a specific role (no DB call - reads from JWT)
 */
export async function hasRole(roleName: string): Promise<boolean> {
	const roles = await getUserRoles();
	return roles !== null && roles.includes(roleName);
}

/**
 * Check if current user is super admin (no DB call - reads from JWT)
 */
export async function isSuperAdmin(): Promise<boolean> {
	return hasRole('super_admin');
}

/**
 * Check if current user is a regular user - no roles or only 'user' role (no DB call)
 * Returns true if user has no roles, or only has the 'user' role
 * Supports backward compatibility with old 'role' string format
 */
export async function isRegularUser(): Promise<boolean> {
	const session = await auth();
	if (!session?.user?.id) return false;

	// Get roles with backward compatibility
	let roles = session.user.roles;
	if (!roles) {
		const oldRole = (session.user as { role?: string | null })?.role;
		if (oldRole) roles = [oldRole];
	}

	// No roles = regular user
	if (!roles || roles.length === 0) return true;
	// Only 'user' role = regular user
	if (roles.length === 1 && roles[0] === 'user') return true;
	// Has any other role = not a regular user
	return false;
}

/**
 * Check if user has any elevated role (not a regular user) - no DB call
 * Returns true if user has any role other than 'user'
 */
export async function hasElevatedRole(): Promise<boolean> {
	const roles = await getUserRoles();
	if (!roles || roles.length === 0) return false;
	// Check if there's any role that's not 'user'
	return roles.some(role => role !== 'user');
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

/**
 * Get all companies where the current user is an owner or manager
 * Used for conditional navigation and company dashboard access
 */
export async function getUserOwnedCompanies(): Promise<Company[]> {
	const session = await auth();

	if (!session?.user?.id) {
		return [];
	}

	const user = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, session.user.id))
		.get();

	if (!user) {
		return [];
	}

	const results = await db
		.select({
			id: companies.id,
			name: companies.name,
			einNumber: companies.einNumber,
			email: companies.email,
			phone: companies.phone,
			websiteUrl: companies.websiteUrl,
			addressLine1: companies.addressLine1,
			addressLine2: companies.addressLine2,
			city: companies.city,
			state: companies.state,
			zipCode: companies.zipCode,
			country: companies.country,
			description: companies.description,
			licenseNumber: companies.licenseNumber,
			insuranceNumber: companies.insuranceNumber,
			isPublic: companies.isPublic,
			memo: companies.memo,
			createdByUserId: companies.createdByUserId,
			status: companies.status,
			createdAt: companies.createdAt,
			updatedAt: companies.updatedAt,
		})
		.from(companies)
		.innerJoin(companyUsers, eq(companies.id, companyUsers.companyId))
		.where(
			and(
				eq(companyUsers.userId, user.id),
				inArray(companyUsers.role, ['owner', 'manager'])
			)
		)
		.all();

	return results;
}

/**
 * Check if the current user is an owner of a specific company
 */
export async function isCompanyOwner(companyId: number): Promise<boolean> {
	const role = await getUserCompanyRole(companyId);
	return role === 'owner';
}

/**
 * Check if the current user can manage support tickets (no DB call)
 * (super admin or agent)
 */
export async function canManageSupportTickets(): Promise<boolean> {
	const roles = await getUserRoles();
	if (!roles) return false;
	return roles.includes('super_admin') || roles.includes('agent');
}

/**
 * Check if the current user is an agent (no DB call)
 */
export async function isAgent(): Promise<boolean> {
	const roles = await getUserRoles();
	if (!roles) return false;
	return roles.includes('agent');
}

/**
 * Check if the current user can manage user carts (no DB call)
 * (super admin or agent)
 */
export async function canManageUserCarts(): Promise<boolean> {
	const roles = await getUserRoles();
	if (!roles) return false;
	return roles.includes('super_admin') || roles.includes('agent');
}