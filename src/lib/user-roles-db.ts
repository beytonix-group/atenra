import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Fetch all user roles from database by authUserId.
 * Used during login to cache roles in JWT token.
 * Returns an array of role names (e.g., ['super_admin', 'manager']) or null if none found.
 *
 * Note: This is a separate file to avoid circular dependencies with auth.ts
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
		console.error("Error fetching user roles:", error);
		return null;
	}
}
