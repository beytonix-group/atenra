import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "edge";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional().nullable(),
  lastName: z.string().min(1).max(50).optional().nullable(),
  displayName: z.string().min(1).max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable().transform(val => val || undefined),
  addressLine1: z.string().max(100).optional().nullable().transform(val => val || undefined),
  addressLine2: z.string().max(100).optional().nullable().transform(val => val || undefined),
  city: z.string().max(50).optional().nullable().transform(val => val || undefined),
  state: z.string().max(50).optional().nullable().transform(val => val || undefined),
  zipCode: z.string().max(20).optional().nullable().transform(val => val || undefined),
  country: z.string().max(50).optional().nullable().transform(val => val || undefined),
});

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.authUserId, session.user.id))
      .get();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user roles
    const userRolesList = await db
      .select({
        roleName: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id))
      .all();

    return NextResponse.json({
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      country: user.country,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      roles: userRolesList.map(r => r.roleName),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Remove undefined values from validatedData
    const updateData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, v]) => v !== undefined)
    );

    const updatedUser = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.authUserId, session.user.id))
      .returning()
      .get();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        displayName: updatedUser.displayName,
        phone: updatedUser.phone,
        addressLine1: updatedUser.addressLine1,
        addressLine2: updatedUser.addressLine2,
        city: updatedUser.city,
        state: updatedUser.state,
        zipCode: updatedUser.zipCode,
        country: updatedUser.country,
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Invalid data"
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}