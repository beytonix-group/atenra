import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
	const session = await auth();
	if (!session?.user?.id) return null;

	const user = await db
		.select()
		.from(users)
		.where(eq(users.authUserId, session.user.id))
		.get();

	return user;
}

export async function getUserRoles(userId: number) {
	const userRoleRecords = await db
		.select({
			roleId: userRoles.roleId,
			roleName: roles.name,
			roleDescription: roles.description,
		})
		.from(userRoles)
		.innerJoin(roles, eq(userRoles.roleId, roles.id))
		.where(eq(userRoles.userId, userId))
		.all();

	return userRoleRecords;
}

export async function hasRole(userId: number, roleName: string): Promise<boolean> {
	const userRoleRecords = await getUserRoles(userId);
	return userRoleRecords.some(r => r.roleName === roleName);
}

export async function isSuperAdmin(): Promise<boolean> {
	const user = await getCurrentUser();
	if (!user) return false;
	return hasRole(user.id, "super_admin");
}

export async function getAllRoles() {
	return await db.select().from(roles).all();
}