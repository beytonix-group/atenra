import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
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