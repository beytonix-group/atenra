import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, userRoles } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { z } from "zod";
import { trackActivity } from "@/lib/server-activity-tracker";
import { auth } from "@/server/auth";


const updateUserSchema = z.object({
	email: z.string().email("Invalid email address"),
	firstName: z.string().max(30).nullable(),
	lastName: z.string().max(30).nullable(),
	displayName: z.string().max(65).nullable(),
	phone: z.string().max(14).nullable(), // (XXX) XXX-XXXX format
	addressLine1: z.string().max(50).nullable().optional(),
	addressLine2: z.string().max(50).nullable().optional(),
	city: z.string().max(50).nullable().optional(),
	state: z.string().max(50).nullable().optional(),
	zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits").nullable().optional().or(z.literal("")).or(z.null()),
	country: z.string().max(50).nullable().optional(),
	status: z.enum(["active", "suspended", "deleted"]),
	emailVerified: z.number().int().min(0).max(1),
	roles: z.array(z.object({
		roleId: z.number().int().positive(),
		roleName: z.string()
	})).optional()
});

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
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const { id } = await params;
		const userId = parseInt(id);
		const body = await request.json();
		
		// Validate the request body
		const validatedData = updateUserSchema.parse(body);
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
			roles: newRoles,
		} = validatedData;

		const updateData: any = {
			email,
			firstName,
			lastName,
			displayName,
			phone,
			status,
			emailVerified,
			updatedAt: Math.floor(Date.now() / 1000),
		};

		// Only include optional fields if they are explicitly provided
		if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
		if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
		if (city !== undefined) updateData.city = city;
		if (state !== undefined) updateData.state = state;
		if (zipCode !== undefined) updateData.zipCode = zipCode;
		if (country !== undefined) updateData.country = country;

		await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, userId));

		// Track role changes
		let roleChanged = false;
		if (newRoles && newRoles.length > 0) {
			await db.delete(userRoles).where(eq(userRoles.userId, userId));
			
			const newRoleId = newRoles[0].roleId;
			await db.insert(userRoles).values({
				userId,
				roleId: newRoleId,
			});
			roleChanged = true;
		}

		// Track admin updating a user
		const session = await auth();
		if (session?.user?.id) {
			const fieldsUpdated = Object.keys(updateData).filter(k => k !== 'updatedAt');
			await trackActivity({
				authUserId: session.user.id,
				action: "admin_update_user",
				info: {
					updatedUserId: userId,
					updatedUserEmail: email,
					fieldsUpdated,
					roleChanged,
					newRoleId: roleChanged && newRoles ? newRoles[0].roleId : undefined,
				},
				request,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating user:", error);
		
		if (error instanceof z.ZodError) {
			return NextResponse.json({ 
				error: "Invalid data", 
				details: error.issues 
			}, { status: 400 });
		}
		
		return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
	}
}