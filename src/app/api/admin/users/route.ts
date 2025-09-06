import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/permissions";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { ROLES } from "@/lib/auth/roles";

export const runtime = "edge";

// GET - List all users with their roles
export async function GET() {
	try {
		// Ensure user is super_admin
		await requireRole(ROLES.SUPER_ADMIN);

		// Fetch all users
		const allUsers = await db.select().from(users).all();

		// Fetch all user roles with role details
		const allUserRoles = await db
			.select({
				userId: userRoles.userId,
				roleId: userRoles.roleId,
				roleName: roles.name,
			})
			.from(userRoles)
			.leftJoin(roles, eq(userRoles.roleId, roles.id))
			.all();

		// Combine users with their roles
		const usersWithRoles = allUsers.map(user => {
			const userRoleData = allUserRoles
				.filter(ur => ur.userId === user.id)
				.map(ur => ({
					id: ur.roleId,
					name: ur.roleName,
				}));

			return {
				...user,
				roles: userRoleData,
			};
		});

		return NextResponse.json(usersWithRoles);
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}

// POST - Create new user
export async function POST(request: NextRequest) {
	try {
		// Ensure user is super_admin
		await requireRole(ROLES.SUPER_ADMIN);

		const data = await request.json() as {
			firstName?: string;
			lastName?: string;
			displayName?: string;
			email?: string;
			password?: string;
			phone?: string;
			addressLine1?: string;
			addressLine2?: string;
			city?: string;
			state?: string;
			zipCode?: string;
			country?: string;
			status?: "active" | "suspended" | "deleted";
			emailVerified?: number;
			roleIds?: number[];
		};
		const {
			firstName,
			lastName,
			displayName,
			email,
			password,
			phone,
			addressLine1,
			addressLine2,
			city,
			state,
			zipCode,
			country = "US",
			status = "active",
			emailVerified = 0,
			roleIds = [],
		} = data;

		// Validate required fields
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.get();

		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 409 }
			);
		}

		// Hash the password
		const passwordHash = await bcrypt.hash(password, 12);

		// Create user
		const newUser = await db
			.insert(users)
			.values({
				firstName,
				lastName,
				displayName,
				email,
				passwordHash,
				phone,
				addressLine1,
				addressLine2,
				city,
				state,
				zipCode,
				country,
				status,
				emailVerified,
			})
			.returning()
			.get();

		// Assign roles if provided
		if (roleIds.length > 0 && newUser) {
			await db.insert(userRoles).values(
				roleIds.map((roleId: number) => ({
					userId: newUser.id,
					roleId,
				}))
			);
		}

		return NextResponse.json({ success: true, userId: newUser?.id });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 }
		);
	}
}