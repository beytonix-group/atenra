import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles, rolePermissions, permissions } from "@/server/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { UserRole, ROLES } from "./roles";

// UserRole type is now imported from ./roles

export interface UserWithRoles {
	id: number;
	email: string;
	roles: {
		id: number;
		name: string;
	}[];
}

/**
 * Get the current user with their roles
 */
export async function getCurrentUserWithRoles(): Promise<UserWithRoles | null> {
	const session = await auth();
	
	if (!session?.user?.email) {
		return null;
	}

	try {
		// Get user from database
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, session.user.email))
			.get();

		if (!user) {
			return null;
		}

		// Get user's roles
		const userRolesData = await db
			.select({
				roleId: userRoles.roleId,
				roleName: roles.name,
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, user.id))
			.all();

		return {
			id: user.id,
			email: user.email,
			roles: userRolesData.map(r => ({
				id: r.roleId,
				name: r.roleName,
			})),
		};
	} catch (error) {
		console.error("Error fetching user with roles:", error);
		return null;
	}
}

/**
 * Check if user has a specific role
 */
export async function hasRole(roleName: UserRole): Promise<boolean> {
	const userWithRoles = await getCurrentUserWithRoles();
	
	if (!userWithRoles) {
		return false;
	}

	return userWithRoles.roles.some(role => role.name === roleName);
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roleNames: UserRole[]): Promise<boolean> {
	const userWithRoles = await getCurrentUserWithRoles();
	
	if (!userWithRoles) {
		return false;
	}

	return userWithRoles.roles.some(role => 
		roleNames.includes(role.name as UserRole)
	);
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(action: string, resource: string): Promise<boolean> {
	const userWithRoles = await getCurrentUserWithRoles();
	
	if (!userWithRoles || userWithRoles.roles.length === 0) {
		return false;
	}

	try {
		// Check if user's roles have the required permission
		const roleIds = userWithRoles.roles.map(r => r.id);
		
		const permission = await db
			.select()
			.from(permissions)
			.innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
			.where(
				and(
					eq(permissions.action, action),
					eq(permissions.resource, resource),
					inArray(rolePermissions.roleId, roleIds)
				)
			)
			.get();

		return !!permission;
	} catch (error) {
		console.error("Error checking permission:", error);
		return false;
	}
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
	const session = await auth();
	
	if (!session?.user) {
		redirect("/login");
	}
	
	return session;
}

/**
 * Require specific role - redirects to unauthorized if user doesn't have the role
 */
export async function requireRole(roleName: UserRole) {
	await requireAuth();
	
	const hasRequiredRole = await hasRole(roleName);
	
	if (!hasRequiredRole) {
		redirect("/unauthorized");
	}
}

/**
 * Require any of the specified roles - redirects to unauthorized if user doesn't have any of them
 */
export async function requireAnyRole(roleNames: UserRole[]) {
	await requireAuth();
	
	const hasRequiredRole = await hasAnyRole(roleNames);
	
	if (!hasRequiredRole) {
		redirect("/unauthorized");
	}
}

/**
 * Require specific permission - redirects to unauthorized if user doesn't have it
 */
export async function requirePermission(action: string, resource: string) {
	await requireAuth();
	
	const hasRequiredPermission = await hasPermission(action, resource);
	
	if (!hasRequiredPermission) {
		redirect("/unauthorized");
	}
}