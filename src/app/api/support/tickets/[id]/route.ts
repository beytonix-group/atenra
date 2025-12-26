import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { supportTickets, users, companies } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { canManageSupportTickets, getCurrentUser } from "@/lib/auth-helpers";
import { sendTicketStatusUpdateEmail } from "@/lib/email-service";

const updateTicketSchema = z.object({
	status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
	assignedToUserId: z.number().nullable().optional(),
	internalNotes: z.string().max(10000).nullable().optional(),
	adminResponse: z.string().max(10000).nullable().optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const ticketId = parseInt(id);

		if (isNaN(ticketId)) {
			return NextResponse.json(
				{ error: "Invalid ticket ID" },
				{ status: 400 }
			);
		}

		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const isAdmin = await canManageSupportTickets();

		// Get ticket with related data
		const ticket = await db
			.select({
				id: supportTickets.id,
				subject: supportTickets.subject,
				description: supportTickets.description,
				urgency: supportTickets.urgency,
				status: supportTickets.status,
				internalNotes: supportTickets.internalNotes,
				adminResponse: supportTickets.adminResponse,
				createdAt: supportTickets.createdAt,
				updatedAt: supportTickets.updatedAt,
				resolvedAt: supportTickets.resolvedAt,
				userId: supportTickets.userId,
				companyId: supportTickets.companyId,
				assignedToUserId: supportTickets.assignedToUserId,
				userName: users.displayName,
				userEmail: users.email,
				companyName: companies.name,
			})
			.from(supportTickets)
			.leftJoin(users, eq(supportTickets.userId, users.id))
			.leftJoin(companies, eq(supportTickets.companyId, companies.id))
			.where(eq(supportTickets.id, ticketId))
			.get();

		if (!ticket) {
			return NextResponse.json(
				{ error: "Ticket not found" },
				{ status: 404 }
			);
		}

		// Check access: user can only see their own tickets unless they're an admin
		if (!isAdmin && ticket.userId !== user.id) {
			return NextResponse.json(
				{ error: "Forbidden" },
				{ status: 403 }
			);
		}

		// Hide internal notes from non-admins
		const responseTicket = isAdmin ? ticket : { ...ticket, internalNotes: null };

		// Get assigned user info if assigned
		let assignedUser = null;
		if (ticket.assignedToUserId) {
			assignedUser = await db
				.select({
					id: users.id,
					displayName: users.displayName,
					email: users.email,
				})
				.from(users)
				.where(eq(users.id, ticket.assignedToUserId))
				.get();
		}

		return NextResponse.json({
			ticket: responseTicket,
			assignedUser,
		});
	} catch (error) {
		console.error("Error fetching support ticket:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const ticketId = parseInt(id);

		if (isNaN(ticketId)) {
			return NextResponse.json(
				{ error: "Invalid ticket ID" },
				{ status: 400 }
			);
		}

		// Only admins can update tickets
		const isAdmin = await canManageSupportTickets();
		if (!isAdmin) {
			return NextResponse.json(
				{ error: "Forbidden - Admin access required" },
				{ status: 403 }
			);
		}

		// Check ticket exists
		const existingTicket = await db
			.select()
			.from(supportTickets)
			.where(eq(supportTickets.id, ticketId))
			.get();

		if (!existingTicket) {
			return NextResponse.json(
				{ error: "Ticket not found" },
				{ status: 404 }
			);
		}

		const body = await request.json();
		const validatedData = updateTicketSchema.parse(body);

		// Build update object
		const updateData: Record<string, unknown> = {
			updatedAt: Math.floor(Date.now() / 1000),
		};

		if (validatedData.status !== undefined) {
			updateData.status = validatedData.status;

			// Set resolvedAt when status changes to resolved
			if (validatedData.status === 'resolved' && existingTicket.status !== 'resolved') {
				updateData.resolvedAt = Math.floor(Date.now() / 1000);
			}
			// Clear resolvedAt if reopening
			if (validatedData.status === 'open' && existingTicket.resolvedAt) {
				updateData.resolvedAt = null;
			}
		}

		if (validatedData.assignedToUserId !== undefined) {
			// Validate assigned user exists if not null
			if (validatedData.assignedToUserId !== null) {
				const assignedUser = await db
					.select()
					.from(users)
					.where(eq(users.id, validatedData.assignedToUserId))
					.get();

				if (!assignedUser) {
					return NextResponse.json(
						{ error: "Assigned user not found" },
						{ status: 400 }
					);
				}
			}
			updateData.assignedToUserId = validatedData.assignedToUserId;
		}

		if (validatedData.internalNotes !== undefined) {
			updateData.internalNotes = validatedData.internalNotes;
		}

		if (validatedData.adminResponse !== undefined) {
			updateData.adminResponse = validatedData.adminResponse;
		}

		const updatedTicket = await db
			.update(supportTickets)
			.set(updateData)
			.where(eq(supportTickets.id, ticketId))
			.returning()
			.get();

		// Send email notification to user if status changed
		if (validatedData.status !== undefined && validatedData.status !== existingTicket.status) {
			// Get user info for email
			const ticketUser = await db
				.select({
					email: users.email,
					displayName: users.displayName,
					firstName: users.firstName,
				})
				.from(users)
				.where(eq(users.id, existingTicket.userId))
				.get();

			if (ticketUser) {
				sendTicketStatusUpdateEmail({
					ticketId: existingTicket.id,
					subject: existingTicket.subject,
					oldStatus: existingTicket.status,
					newStatus: validatedData.status,
					userEmail: ticketUser.email,
					userName: ticketUser.displayName || ticketUser.firstName || ticketUser.email,
				}).catch((err) => {
					console.error("Failed to send ticket status update notification:", err);
				});
			}
		}

		return NextResponse.json({ ticket: updatedTicket });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Error updating support ticket:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
