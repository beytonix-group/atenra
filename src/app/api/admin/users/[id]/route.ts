import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, userRoles } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";

export const runtime = "edge";

interface UpdateUserBody {
	email: string;
	firstName: string | null;
	lastName: string | null;
	displayName: string | null;
	phone: string | null;
	status: "active" | "suspended" | "deleted";
	emailVerified: number;
	roles?: { roleId: number; roleName: string }[];
}

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const userId = parseInt(params.id);
		const body = await request.json() as UpdateUserBody;

		const {
			email,
			firstName,
			lastName,
			displayName,
			phone,
			status,
			emailVerified,
			roles: newRoles,
		} = body;

		await db
			.update(users)
			.set({
				email,
				firstName,
				lastName,
				displayName,
				phone,
				status,
				emailVerified,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));

		if (newRoles && newRoles.length > 0) {
			await db.delete(userRoles).where(eq(userRoles.userId, userId));
			
			const newRoleId = newRoles[0].roleId;
			await db.insert(userRoles).values({
				userId,
				roleId: newRoleId,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
	}
}