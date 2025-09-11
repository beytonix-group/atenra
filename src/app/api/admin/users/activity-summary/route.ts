import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, userActivities, userRoles, roles } from "@/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";

export const runtime = "edge";

export async function GET() {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Get all users with their roles
		const usersWithRoles = await db
			.select({
				id: users.id,
				email: users.email,
				firstName: users.firstName,
				lastName: users.lastName,
				displayName: users.displayName,
				roleId: userRoles.roleId,
				roleName: roles.name,
			})
			.from(users)
			.leftJoin(userRoles, eq(users.id, userRoles.userId))
			.leftJoin(roles, eq(userRoles.roleId, roles.id))
			.all();

		// Get last activity for each user
		const lastActivities = await db
			.select({
				userId: userActivities.userId,
				lastActivity: sql<number>`MAX(${userActivities.createdAt})`.as('lastActivity'),
			})
			.from(userActivities)
			.groupBy(userActivities.userId)
			.all();

		// Create a map of userId to lastActivity
		const activityMap = new Map<number, number>();
		for (const activity of lastActivities) {
			if (activity.userId && activity.lastActivity) {
				activityMap.set(activity.userId, activity.lastActivity);
			}
		}

		// Group users and combine with activity data
		const userMap = new Map<number, any>();
		
		for (const row of usersWithRoles) {
			const userId = row.id;
			
			if (!userMap.has(userId)) {
				userMap.set(userId, {
					id: row.id,
					email: row.email,
					firstName: row.firstName,
					lastName: row.lastName,
					displayName: row.displayName,
					roles: [],
					lastActivity: activityMap.get(userId) || null,
				});
			}
			
			// Add role if exists
			if (row.roleId && row.roleName) {
				userMap.get(userId).roles.push({
					roleId: row.roleId,
					roleName: row.roleName
				});
			}
		}

		const result = Array.from(userMap.values());
		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching users with activity:", error);
		return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
	}
}