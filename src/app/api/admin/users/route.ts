import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";

export const runtime = "edge";

export async function GET() {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const allUsers = await db.select().from(users).all();
		
		const usersWithRoles = await Promise.all(
			allUsers.map(async (user) => {
				const userRoleRecords = await db
					.select({
						roleId: userRoles.roleId,
						roleName: roles.name,
					})
					.from(userRoles)
					.innerJoin(roles, eq(userRoles.roleId, roles.id))
					.where(eq(userRoles.userId, user.id))
					.all();

				return {
					...user,
					roles: userRoleRecords,
				};
			})
		);

		return NextResponse.json(usersWithRoles);
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
	}
}