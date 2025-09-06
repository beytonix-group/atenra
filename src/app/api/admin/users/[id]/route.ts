import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/server/db";
import { users, userRoles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ROLES } from "@/lib/auth/roles";

export const runtime = "edge";

// PUT - Update user
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Ensure user is super_admin
		await requireRole(ROLES.SUPER_ADMIN);

		const userId = parseInt(params.id);
		if (isNaN(userId)) {
			return NextResponse.json(
				{ error: "Invalid user ID" },
				{ status: 400 }
			);
		}

		const data = await request.json();
		const {
			firstName,
			lastName,
			displayName,
			email,
			phone,
			city,
			state,
			country,
			status,
			emailVerified,
			roleIds = [],
		} = data;

		// Validate required fields
		if (!email) {
			return NextResponse.json(
				{ error: "Email is required" },
				{ status: 400 }
			);
		}

		// Check if user exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.get();

		if (!existingUser) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Check if email is already taken by another user
		if (email !== existingUser.email) {
			const emailTaken = await db
				.select()
				.from(users)
				.where(eq(users.email, email))
				.get();

			if (emailTaken) {
				return NextResponse.json(
					{ error: "Email is already taken by another user" },
					{ status: 409 }
				);
			}
		}

		// Update user
		await db
			.update(users)
			.set({
				firstName,
				lastName,
				displayName,
				email,
				phone,
				city,
				state,
				country,
				status,
				emailVerified,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(users.id, userId));

		// Update user roles
		// First, delete existing roles
		await db.delete(userRoles).where(eq(userRoles.userId, userId));

		// Then, add new roles
		if (roleIds.length > 0) {
			await db.insert(userRoles).values(
				roleIds.map((roleId: number) => ({
					userId,
					roleId,
				}))
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete user
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Ensure user is super_admin
		await requireRole(ROLES.SUPER_ADMIN);

		const userId = parseInt(params.id);
		if (isNaN(userId)) {
			return NextResponse.json(
				{ error: "Invalid user ID" },
				{ status: 400 }
			);
		}

		// Check if user exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.get();

		if (!existingUser) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Delete user roles first (due to foreign key constraint)
		await db.delete(userRoles).where(eq(userRoles.userId, userId));

		// Delete user
		await db.delete(users).where(eq(users.id, userId));

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}