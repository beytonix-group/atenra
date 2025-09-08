import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

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

interface CreateUserBody {
	email: string;
	firstName?: string;
	lastName?: string;
	displayName?: string;
	phone?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	status?: "active" | "suspended" | "deleted";
	emailVerified?: boolean;
	roleId?: number;
}

export async function POST(request: NextRequest) {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const body = await request.json() as CreateUserBody;
		const {
			email,
			firstName,
			lastName,
			displayName,
			phone,
			addressLine1,
			addressLine2,
			city,
			state,
			zipCode,
			country,
			status,
			emailVerified,
			roleId
		} = body;

		// Check if user with email already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.get();

		if (existingUser) {
			return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
		}

		// Generate a random password (user will need to reset it)
		const tempPassword = Math.random().toString(36).slice(-8);
		const passwordHash = await bcrypt.hash(tempPassword, 10);

		// Create the user
		const newUser = await db
			.insert(users)
			.values({
				email,
				passwordHash,
				firstName: firstName || null,
				lastName: lastName || null,
				displayName: displayName || null,
				phone: phone || null,
				addressLine1: addressLine1 || null,
				addressLine2: addressLine2 || null,
				city: city || null,
				state: state || null,
				zipCode: zipCode || null,
				country: country || "US",
				status: status || "active",
				emailVerified: emailVerified ? 1 : 0,
			})
			.returning()
			.get();

		// Assign role if provided
		if (roleId && newUser) {
			await db.insert(userRoles).values({
				userId: newUser.id,
				roleId: roleId,
			});
		}

		return NextResponse.json({ 
			success: true, 
			user: newUser,
			tempPassword // In production, send this via email instead
		});
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	}
}