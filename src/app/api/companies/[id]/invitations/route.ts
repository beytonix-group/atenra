import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { employeeInvitations, companies, users, companyUsers } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/auth-helpers";
import { sendInvitationEmail } from "@/lib/email-service";


// GET - Fetch all pending invitations for a company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const companyId = parseInt(id);

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

    // Fetch all invitations for the company
    const invitations = await db
      .select({
        id: employeeInvitations.id,
        email: employeeInvitations.email,
        userId: employeeInvitations.userId,
        status: employeeInvitations.status,
        expiresAt: employeeInvitations.expiresAt,
        createdAt: employeeInvitations.createdAt,
        acceptedAt: employeeInvitations.acceptedAt,
      })
      .from(employeeInvitations)
      .where(eq(employeeInvitations.companyId, companyId))
      .orderBy(employeeInvitations.createdAt)
      .all();

    // Add computed fields for each invitation
    const currentTime = Math.floor(Date.now() / 1000);
    const enrichedInvitations = invitations.map(inv => ({
      ...inv,
      isExpired: inv.expiresAt < currentTime,
      expiresInHours: Math.max(0, Math.floor((inv.expiresAt - currentTime) / 3600)),
    }));

    return NextResponse.json({ invitations: enrichedInvitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}

// POST - Resend invitation email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const companyId = parseInt(id);

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

    const body: unknown = await request.json();

    if (!body || typeof body !== 'object' || !('invitationId' in body)) {
      return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 });
    }

    const { invitationId } = body as { invitationId: number };

    // Fetch invitation
    const invitation = await db
      .select()
      .from(employeeInvitations)
      .where(
        and(
          eq(employeeInvitations.id, invitationId),
          eq(employeeInvitations.companyId, companyId)
        )
      )
      .get();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if invitation is already accepted
    if (invitation.status === "accepted") {
      return NextResponse.json(
        { error: "Cannot resend an accepted invitation" },
        { status: 400 }
      );
    }

    // Generate new token and extend expiration
    const newToken = crypto.randomUUID();
    const newExpiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

    // Update invitation with new token and expiration
    await db
      .update(employeeInvitations)
      .set({
        token: newToken,
        expiresAt: newExpiresAt,
        status: "pending",
      })
      .where(eq(employeeInvitations.id, invitation.id));

    // Resend invitation email
    const emailResult = await sendInvitationEmail({
      email: invitation.email,
      companyName: company.name,
      invitationToken: newToken,
      expiresInHours: 24,
    });

    if (!emailResult.success) {
      console.error("Failed to resend invitation email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send invitation email", details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitation email resent successfully",
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: newExpiresAt,
      },
    });
  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json({ error: "Failed to resend invitation" }, { status: 500 });
  }
}

// DELETE - Cancel/revoke pending invitation and clean up user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isSuperAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const companyId = parseInt(id);

    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== 'object' || !('invitationId' in body)) {
      return NextResponse.json({ error: "Invitation ID is required" }, { status: 400 });
    }

    const { invitationId } = body as { invitationId: number };

    // Fetch invitation to verify it belongs to this company
    const invitation = await db
      .select()
      .from(employeeInvitations)
      .where(
        and(
          eq(employeeInvitations.id, invitationId),
          eq(employeeInvitations.companyId, companyId)
        )
      )
      .get();

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // If invitation is still pending (never accepted), clean up completely
    if (invitation.status === "pending" && invitation.userId) {
      // Fetch the user to verify they have a placeholder password
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, invitation.userId))
        .get();

      if (user && user.passwordHash && user.passwordHash.startsWith("PENDING_INVITATION_")) {
        // This is a pending account that was never activated
        // Delete the user account (cascades to company_users and invitations)
        await db
          .delete(users)
          .where(eq(users.id, invitation.userId));

        console.log(`✅ Cleaned up pending employee account for ${invitation.email} (user_id: ${invitation.userId})`);

        return NextResponse.json({
          success: true,
          message: "Pending invitation and account deleted successfully. Email can be re-invited.",
        });
      }
    }

    // If invitation was accepted or user doesn't have placeholder password,
    // just mark invitation as expired (keep the user account)
    await db
      .update(employeeInvitations)
      .set({
        status: "expired",
      })
      .where(eq(employeeInvitations.id, invitation.id));

    return NextResponse.json({
      success: true,
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return NextResponse.json({ error: "Failed to cancel invitation" }, { status: 500 });
  }
}
