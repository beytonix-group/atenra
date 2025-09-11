import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { trackActivity } from "@/lib/server-activity-tracker";
import { auth } from "@/server/auth";

export const runtime = "edge";

const createUserSchema = z.object({
	email: z.string().email("Invalid email address"),
	firstName: z.string().max(30).optional(),
	lastName: z.string().max(30).optional(),
	displayName: z.string().max(65).optional(),
	phone: z.string().max(14).optional(), // (XXX) XXX-XXXX format
	addressLine1: z.string().max(50).optional(),
	addressLine2: z.string().max(50).optional(),
	city: z.string().max(50).optional(),
	state: z.string().max(50).optional(),
	zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits").optional().or(z.literal("")),
	country: z.string().max(50).optional(),
	status: z.enum(["active", "suspended", "deleted"]).optional(),
	emailVerified: z.boolean().optional(),
	roleId: z.number().int().positive().optional(),
});

export async function GET() {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		// Fetch all users with their roles in a single query
		const usersWithRoles = await db
			.select({
				id: users.id,
				email: users.email,
				passwordHash: users.passwordHash,
				firstName: users.firstName,
				lastName: users.lastName,
				displayName: users.displayName,
				phone: users.phone,
				addressLine1: users.addressLine1,
				addressLine2: users.addressLine2,
				city: users.city,
				state: users.state,
				zipCode: users.zipCode,
				country: users.country,
				status: users.status,
				emailVerified: users.emailVerified,
				authUserId: users.authUserId,
				createdAt: users.createdAt,
				updatedAt: users.updatedAt,
				roleId: userRoles.roleId,
				roleName: roles.name,
			})
			.from(users)
			.leftJoin(userRoles, eq(users.id, userRoles.userId))
			.leftJoin(roles, eq(userRoles.roleId, roles.id))
			.all();

		// Group the results by user
		const userMap = new Map<number, any>();
		
		for (const row of usersWithRoles) {
			const userId = row.id;
			
			if (!userMap.has(userId)) {
				userMap.set(userId, {
					id: row.id,
					email: row.email,
					passwordHash: row.passwordHash,
					firstName: row.firstName,
					lastName: row.lastName,
					displayName: row.displayName,
					phone: row.phone,
					addressLine1: row.addressLine1,
					addressLine2: row.addressLine2,
					city: row.city,
					state: row.state,
					zipCode: row.zipCode,
					country: row.country,
					status: row.status,
					emailVerified: row.emailVerified,
					authUserId: row.authUserId,
					createdAt: row.createdAt,
					updatedAt: row.updatedAt,
					roles: []
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

		// Convert map to array
		const formattedUsers = Array.from(userMap.values());

		// Track admin viewing users list
		const session = await auth();
		if (session?.user?.id) {
			await trackActivity({
				authUserId: session.user.id,
				action: "admin_view_users",
				info: {
					userCount: formattedUsers.length
				}
			});
		}

		return NextResponse.json(formattedUsers);
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

		const body = await request.json();
		
		// Validate the request body
		const validatedData = createUserSchema.parse(body);
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
		} = validatedData;

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

		// Track admin creating a new user
		const session = await auth();
		if (session?.user?.id && newUser) {
			await trackActivity({
				authUserId: session.user.id,
				action: "admin_create_user",
				info: {
					createdUserId: newUser.id,
					createdUserEmail: newUser.email,
					assignedRoleId: roleId,
				},
				request,
			});
		}

		return NextResponse.json({ 
			success: true, 
			user: newUser,
			tempPassword // In production, send this via email instead
		});
	} catch (error) {
		console.error("Error creating user:", error);
		
		if (error instanceof z.ZodError) {
			return NextResponse.json({ 
				error: "Invalid data", 
				details: error.errors 
			}, { status: 400 });
		}
		
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	}
}