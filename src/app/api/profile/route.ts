import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "edge";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(30).optional(),
  lastName: z.string().min(1).max(30).optional(),
  displayName: z.string().min(1).max(65).optional(),
  phone: z.string().max(14).optional(), // (XXX) XXX-XXXX format
  addressLine1: z.string().max(50).optional(),
  addressLine2: z.string().max(50).optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits").optional(),
  country: z.string().max(50).optional(),
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

    // Get user roles
    const userRoleRecords = await db
      .select({
        roleId: userRoles.roleId,
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
      roles: userRoleRecords,
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

    const updatedUser = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: Math.floor(Date.now() / 1000),
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