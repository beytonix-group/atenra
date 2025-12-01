import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { users, userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { trackActivity } from "@/lib/server-activity-tracker";

export const runtime = "edge";

const updateProfileSchema = z.object({
  firstName: z.string().max(30).nullish().transform(val => val || ""),
  lastName: z.string().max(30).nullish().transform(val => val || ""),
  displayName: z.string().max(65).nullish().transform(val => val || ""),
  phone: z.string().max(20).nullish().transform(val => val || ""),
  addressLine1: z.string().max(50).nullish().transform(val => val || ""),
  addressLine2: z.string().max(50).nullish().transform(val => val || ""),
  city: z.string().max(50).nullish().transform(val => val || ""),
  state: z.string().max(50).nullish().transform(val => val || ""),
  zipCode: z.union([
    z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
    z.string().length(0),
    z.literal(""),
    z.null(),
    z.undefined()
  ]).transform(val => val || "").optional(),
  country: z.string().max(50).nullish().transform(val => val || ""),
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
      id: user.id, // Include database user ID for tracking
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

    // Track the profile update activity
    await trackActivity({
      userId: updatedUser.id,
      authUserId: session.user.id,
      action: "profile_update",
      info: {
        fieldsUpdated: Object.keys(validatedData),
      },
      request,
    });

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
      const errorMessages = error.issues.map(err => {
        return `${err.path.join('.')}: ${err.message}`;
      }).join(', ');

      return NextResponse.json({
        error: `Validation error: ${errorMessages}`
      }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}