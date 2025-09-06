import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function GET() {
	try {
		const session = await auth();
		
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user from database
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, session.user.email))
			.get();

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get user's roles
		const userRolesData = await db
			.select({
				id: roles.id,
				name: roles.name,
			})
			.from(userRoles)
			.innerJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(userRoles.userId, user.id))
			.all();

		return NextResponse.json(userRolesData);
	} catch (error) {
		console.error("Error fetching user roles:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user roles" },
			{ status: 500 }
		);
	}
}