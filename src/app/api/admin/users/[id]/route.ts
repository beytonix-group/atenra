import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, userRoles } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

export const runtime = "edge";

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
	{ params }: { params: { id: string } }
) {
	try {
		const isAdmin = await isSuperAdmin();
		if (!isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
		}

		const userId = parseInt(params.id);
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

		await db
			.update(users)
			.set({
				email,
				firstName,
				lastName,
				displayName,
				phone,
				addressLine1: addressLine1 !== undefined ? addressLine1 : undefined,
				addressLine2: addressLine2 !== undefined ? addressLine2 : undefined,
				city: city !== undefined ? city : undefined,
				state: state !== undefined ? state : undefined,
				zipCode: zipCode !== undefined ? zipCode : undefined,
				country: country !== undefined ? country : undefined,
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
		
		if (error instanceof z.ZodError) {
			return NextResponse.json({ 
				error: "Invalid data", 
				details: error.errors 
			}, { status: 400 });
		}
		
		return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
	}
}