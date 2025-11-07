import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users, companyUsers, companies, userRoles, roles } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { trackActivity } from "@/lib/server-activity-tracker";
import { auth } from "@/server/auth";

export const runtime = "edge";

const createEmployeeSchema = z.object({
	email: z.string().email("Invalid email address"),
	firstName: z.string().max(30).optional(),
	lastName: z.string().max(30).optional(),
	displayName: z.string().max(65).optional(),
	phone: z.string().max(14).optional(),
	addressLine1: z.string().max(50).optional(),
	addressLine2: z.string().max(50).optional(),
	city: z.string().max(50).optional(),
	state: z.string().max(50).optional(),
	zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits").optional().or(z.literal("")),
	country: z.string().max(50).optional(),
	companyRole: z.enum(["owner", "manager", "staff"]),
	systemRoleId: z.number().int().positive().optional(),
});

// GET - Fetch all employees for a company
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const companyId = parseInt(params.id);

		if (isNaN(companyId)) {
			return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
		}

		// Verify company exists
		const company = await db
			.select()
			.from(companies)
			.where(eq(companies.id, companyId))
			.get();

		if (!company) {
			return NextResponse.json({ error: "Company not found" }, { status: 404 });
		}

		// Fetch all employees with their user details and roles
		const employees = await db
			.select({
				userId: users.id,
				email: users.email,
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
				companyRole: companyUsers.role,
				isDefault: companyUsers.isDefault,
				invitedAt: companyUsers.invitedAt,
				systemRoleId: userRoles.roleId,
				systemRoleName: roles.name,
			})
			.from(companyUsers)
			.innerJoin(users, eq(companyUsers.userId, users.id))
			.leftJoin(userRoles, eq(users.id, userRoles.userId))
			.leftJoin(roles, eq(userRoles.roleId, roles.id))
			.where(eq(companyUsers.companyId, companyId))
			.all();

		return NextResponse.json({ employees });
	} catch (error) {
		console.error("Error fetching company employees:", error);
		return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
	}
}

// POST - Create new employee and link to company
export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const companyId = parseInt(params.id);

		if (isNaN(companyId)) {
			return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
		}

		// Verify company exists
		const company = await db
			.select()
			.from(companies)
			.where(eq(companies.id, companyId))
			.get();

		if (!company) {
			return NextResponse.json({ error: "Company not found" }, { status: 404 });
		}

		const body = await request.json();

		// Validate the request body
		const validatedData = createEmployeeSchema.parse(body);
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
			companyRole,
			systemRoleId,
		} = validatedData;

		// Check if user with email already exists
		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, email.toLowerCase()))
			.get();

		if (existingUser) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 400 }
			);
		}

		// Generate a random password (user will need to reset it)
		const tempPassword = Math.random().toString(36).slice(-8);
		const passwordHash = await bcrypt.hash(tempPassword, 10);

		// Create the user
		const newUser = await db
			.insert(users)
			.values({
				email: email.toLowerCase(),
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
				status: "active",
				emailVerified: 0,
			})
			.returning()
			.get();

		if (!newUser) {
			return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
		}

		// Link user to company
		const companyRelationship = await db
			.insert(companyUsers)
			.values({
				companyId,
				userId: newUser.id,
				role: companyRole,
				isDefault: 0,
			})
			.returning()
			.get();

		// Assign system role (default to 'employee' if not provided)
		let assignedRoleId = systemRoleId;
		if (!assignedRoleId) {
			// Get the 'employee' role ID
			const employeeRole = await db
				.select()
				.from(roles)
				.where(eq(roles.name, "employee"))
				.get();

			if (employeeRole) {
				assignedRoleId = employeeRole.id;
			}
		}

		if (assignedRoleId) {
			await db.insert(userRoles).values({
				userId: newUser.id,
				roleId: assignedRoleId,
			});
		}

		// Track activity
		const session = await auth();
		if (session?.user?.id) {
			await trackActivity({
				authUserId: session.user.id,
				action: "admin_create_employee",
				info: {
					companyId,
					companyName: company.name,
					userId: newUser.id,
					userEmail: newUser.email,
					companyRole,
					systemRoleId: assignedRoleId,
				},
				request,
			});
		}

		return NextResponse.json({
			success: true,
			user: newUser,
			companyRelationship,
			tempPassword, // In production, send this via email instead
		});
	} catch (error) {
		console.error("Error creating employee:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Invalid data",
					details: error.errors,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
	}
}

// DELETE - Remove employee from company
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const companyId = parseInt(params.id);

		if (isNaN(companyId)) {
			return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
		}

		const body: unknown = await request.json();

		if (!body || typeof body !== 'object' || !('userId' in body)) {
			return NextResponse.json({ error: "User ID is required" }, { status: 400 });
		}

		const { userId } = body as { userId: number };

		if (!userId || typeof userId !== "number") {
			return NextResponse.json({ error: "User ID is required" }, { status: 400 });
		}

		// Delete the company-user relationship
		const deleted = await db
			.delete(companyUsers)
			.where(
				and(
					eq(companyUsers.companyId, companyId),
					eq(companyUsers.userId, userId)
				)
			)
			.returning()
			.get();

		if (!deleted) {
			return NextResponse.json(
				{ error: "Employee not found in this company" },
				{ status: 404 }
			);
		}

		// Track activity
		const session = await auth();
		if (session?.user?.id) {
			await trackActivity({
				authUserId: session.user.id,
				action: "admin_remove_employee",
				info: {
					companyId,
					userId,
				},
				request,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error removing employee:", error);
		return NextResponse.json({ error: "Failed to remove employee" }, { status: 500 });
	}
}
