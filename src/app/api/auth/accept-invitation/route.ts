import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { employeeInvitations, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPasswordEdge } from "@/lib/password-utils";


const acceptInvitationSchema = z.object({
  token: z.string().uuid("Invalid token format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  firstName: z.string().max(30).optional(),
  lastName: z.string().max(30).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = acceptInvitationSchema.parse(body);
    const { token, password, firstName, lastName } = validatedData;

    // Fetch invitation details
    const invitation = await db
      .select()
      .from(employeeInvitations)
      .where(eq(employeeInvitations.token, token))
      .get();

    // Check if invitation exists
    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "This invitation has already been accepted" },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (invitation.expiresAt < currentTime || invitation.status === "expired") {
      // Update status to expired if not already
      if (invitation.status !== "expired") {
        await db
          .update(employeeInvitations)
          .set({ status: "expired" })
          .where(eq(employeeInvitations.id, invitation.id));
      }

      return NextResponse.json(
        { error: "This invitation has expired. Please contact your administrator for a new invitation." },
        { status: 400 }
      );
    }

    // Check if user exists
    if (!invitation.userId) {
      return NextResponse.json(
        { error: "User account not found for this invitation" },
        { status: 404 }
      );
    }

    // Fetch user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, invitation.userId))
      .get();

    if (!user) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 }
      );
    }

    // Hash the new password using edge-compatible PBKDF2
    const passwordHash = await hashPasswordEdge(password);

    // Update user with password and optional profile fields
    await db
      .update(users)
      .set({
        passwordHash,
        firstName: firstName?.trim() || user.firstName,
        lastName: lastName?.trim() || user.lastName,
        emailVerified: 1, // Mark email as verified since they clicked the link
        status: "active",
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(users.id, user.id));

    // Update invitation status
    await db
      .update(employeeInvitations)
      .set({
        status: "accepted",
        acceptedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(employeeInvitations.id, invitation.id));

    return NextResponse.json({
      success: true,
      message: "Account set up successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to set up account. Please try again." },
      { status: 500 }
    );
  }
}
