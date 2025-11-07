import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { users, companyUsers, companies, userRoles, roles, employeeInvitations } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin, hasCompanyManagementAccess } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { trackActivity } from "@/lib/server-activity-tracker";
import { auth } from "@/server/auth";
import { sendInvitationEmail } from "@/lib/email-service";

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
		const companyId = parseInt(params.id);

		if (isNaN(companyId)) {
			return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
		}

		// Check if user has management privileges (super admin, owner, or manager)
		const canManage = await hasCompanyManagementAccess(companyId);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden - You must be a company owner, manager, or super admin to view employees" },
				{ status: 403 }
			);
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
		const companyId = parseInt(params.id);

		if (isNaN(companyId)) {
			return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
		}

		// Check if user has management privileges (super admin, owner, or manager)
		const canManage = await hasCompanyManagementAccess(companyId);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden - You must be a company owner, manager, or super admin to add employees" },
				{ status: 403 }
			);
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

		let userToLink;

		if (existingUser) {
			// User exists, check if they're already associated with this company
			const existingAssociation = await db
				.select()
				.from(companyUsers)
				.where(
					and(
						eq(companyUsers.userId, existingUser.id),
						eq(companyUsers.companyId, companyId)
					)
				)
				.get();

			if (existingAssociation) {
				return NextResponse.json(
					{ error: "This user is already an employee of this company" },
					{ status: 400 }
				);
			}

			// Check if there's already a pending invitation for this email and company
			const existingInvitation = await db
				.select()
				.from(employeeInvitations)
				.where(
					and(
						eq(employeeInvitations.email, email.toLowerCase()),
						eq(employeeInvitations.companyId, companyId),
						eq(employeeInvitations.status, "pending")
					)
				)
				.get();

			if (existingInvitation) {
				return NextResponse.json(
					{ error: "An invitation has already been sent to this email for this company" },
					{ status: 400 }
				);
			}

			// User exists but not associated with this company - reuse the existing user
			userToLink = existingUser;

			// Update user information if provided
			if (firstName || lastName || displayName || phone || addressLine1 || city || state) {
				const updateData: Record<string, string | null> = {};
				if (firstName) updateData.firstName = firstName;
				if (lastName) updateData.lastName = lastName;
				if (displayName) updateData.displayName = displayName;
				if (phone) updateData.phone = phone;
				if (addressLine1) updateData.addressLine1 = addressLine1;
				if (addressLine2) updateData.addressLine2 = addressLine2;
				if (city) updateData.city = city;
				if (state) updateData.state = state;
				if (zipCode) updateData.zipCode = zipCode;
				if (country) updateData.country = country;

				await db
					.update(users)
					.set(updateData)
					.where(eq(users.id, existingUser.id));
			}
		} else {
			// User doesn't exist, create new user
			// Check if there's already a pending invitation for this email and company
			const existingInvitation = await db
				.select()
				.from(employeeInvitations)
				.where(
					and(
						eq(employeeInvitations.email, email.toLowerCase()),
						eq(employeeInvitations.companyId, companyId),
						eq(employeeInvitations.status, "pending")
					)
				)
				.get();

			if (existingInvitation) {
				return NextResponse.json(
					{ error: "An invitation has already been sent to this email for this company" },
					{ status: 400 }
				);
			}

			// Create the user with placeholder password (will be set when they accept invitation)
			// Using a unique placeholder that will never match any real password attempt
			const placeholderPasswordHash = `PENDING_INVITATION_${crypto.randomUUID()}`;

			const newUser = await db
				.insert(users)
				.values({
					email: email.toLowerCase(),
					passwordHash: placeholderPasswordHash, // Placeholder password (not a real hash)
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

			userToLink = newUser;
		}

		// Link user to company
		const companyRelationship = await db
			.insert(companyUsers)
			.values({
				companyId,
				userId: userToLink.id,
				role: companyRole,
				isDefault: 0,
			})
			.returning()
			.get();

		// Note: System role is automatically assigned by database trigger (auto_assign_user_role)
		// which assigns the 'user' role to all new users

		// Generate unique invitation token
		const invitationToken = crypto.randomUUID();

		// Set expiration to 24 hours from now (in Unix timestamp)
		const expiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

		// Create invitation record
		const invitation = await db
			.insert(employeeInvitations)
			.values({
				email: email.toLowerCase(),
				companyId,
				userId: userToLink.id,
				token: invitationToken,
				expiresAt,
				status: "pending",
			})
			.returning()
			.get();

		if (!invitation) {
			return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
		}

		// Send invitation email
		const emailResult = await sendInvitationEmail({
			email: email.toLowerCase(),
			companyName: company.name,
			invitationToken,
			expiresInHours: 24,
		});

		if (!emailResult.success) {
			console.error("Failed to send invitation email:", emailResult.error);
			// Don't fail the entire request if email fails, but log it
			// The invitation is still in the database and can be resent
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
					userId: userToLink.id,
					userEmail: userToLink.email,
					companyRole,
					invitationSent: emailResult.success,
				},
				request,
			});
		}

		return NextResponse.json({
			success: true,
			user: {
				id: userToLink.id,
				email: userToLink.email,
				firstName: userToLink.firstName,
				lastName: userToLink.lastName,
			},
			invitation: {
				id: invitation.id,
				expiresAt: invitation.expiresAt,
			},
			emailSent: emailResult.success,
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
		const companyId = parseInt(params.id);

		if (isNaN(companyId)) {
			return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
		}

		// Check if user has management privileges (super admin, owner, or manager)
		const canManage = await hasCompanyManagementAccess(companyId);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden - You must be a company owner, manager, or super admin to remove employees" },
				{ status: 403 }
			);
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
