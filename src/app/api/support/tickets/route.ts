import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { supportTickets, users, companies } from "@/server/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { z } from "zod";
import { canManageSupportTickets, getCurrentUser } from "@/lib/auth-helpers";
import { sendTicketCreatedAdminEmail } from "@/lib/email-service";

const createTicketSchema = z.object({
	subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject cannot exceed 200 characters"),
	description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description cannot exceed 5000 characters"),
	urgency: z.enum(['minor', 'urgent', 'critical']),
	companyId: z.number().optional(),
});

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		let body;
		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{ error: "Invalid JSON body" },
				{ status: 400 }
			);
		}
		const validatedData = createTicketSchema.parse(body);

		// Verify company access and get company name if companyId is provided
		let companyName: string | null = null;
		if (validatedData.companyId) {
			const company = await db
				.select({ id: companies.id, name: companies.name })
				.from(companies)
				.where(eq(companies.id, validatedData.companyId))
				.get();

			if (!company) {
				return NextResponse.json(
					{ error: "Company not found" },
					{ status: 404 }
				);
			}

			// TODO: Add authorization check - verify user belongs to company
			companyName = company.name;
		}

		const newTicket = await db
			.insert(supportTickets)
			.values({
				userId: user.id,
				companyId: validatedData.companyId || null,
				subject: validatedData.subject,
				description: validatedData.description,
				urgency: validatedData.urgency,
				status: 'open',
			})
			.returning()
			.get();

		// Send email notification to admins (non-blocking)
		sendTicketCreatedAdminEmail({
			ticketId: newTicket.id,
			subject: validatedData.subject,
			urgency: validatedData.urgency,
			userName: user.displayName || user.firstName || user.email,
			userEmail: user.email,
			companyName,
		}).catch((err) => {
			console.error("Failed to send ticket created notification:", err);
		});

		return NextResponse.json({ ticket: newTicket }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Error creating support ticket:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
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
		const { searchParams } = new URL(request.url);

		// Parse query params
		const status = searchParams.get('status');
		const urgency = searchParams.get('urgency');
		const limitParam = parseInt(searchParams.get('limit') || '50', 10);
		const offsetParam = parseInt(searchParams.get('offset') || '0', 10);
		const limit = Math.min(Math.max(isNaN(limitParam) ? 50 : limitParam, 1), 100);
		const offset = isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;
		const sortBy = searchParams.get('sortBy') || 'createdAt';
		const sortOrderParam = searchParams.get('sortOrder') || 'desc';
		const sortOrder = sortOrderParam === 'asc' ? 'asc' : 'desc';

		// Build conditions
		const conditions = [];

		// Non-admins can only see their own tickets
		if (!isAdmin) {
			conditions.push(eq(supportTickets.userId, user.id));
		}

		if (status) {
			const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
			if (validStatuses.includes(status)) {
				conditions.push(eq(supportTickets.status, status as 'open' | 'in_progress' | 'resolved' | 'closed'));
			}
		}

		if (urgency) {
			const validUrgencies = ['minor', 'urgent', 'critical'];
			if (validUrgencies.includes(urgency)) {
				conditions.push(eq(supportTickets.urgency, urgency as 'minor' | 'urgent' | 'critical'));
			}
		}

		// Define sortable columns
		const sortableColumns = {
			createdAt: supportTickets.createdAt,
			updatedAt: supportTickets.updatedAt,
			status: supportTickets.status,
			urgency: supportTickets.urgency,
			subject: supportTickets.subject,
		} as const;
		const sortColumn = sortableColumns[sortBy as keyof typeof sortableColumns] || supportTickets.createdAt;

		// Query tickets with user and company info
		const tickets = await db
			.select({
				id: supportTickets.id,
				subject: supportTickets.subject,
				description: supportTickets.description,
				urgency: supportTickets.urgency,
				status: supportTickets.status,
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
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
			.limit(limit)
			.offset(offset)
			.all();

		// Get total count
		const countConditions = isAdmin ? [] : [eq(supportTickets.userId, user.id)];
		if (status) {
			const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
			if (validStatuses.includes(status)) {
				countConditions.push(eq(supportTickets.status, status as 'open' | 'in_progress' | 'resolved' | 'closed'));
			}
		}
		if (urgency) {
			const validUrgencies = ['minor', 'urgent', 'critical'];
			if (validUrgencies.includes(urgency)) {
				countConditions.push(eq(supportTickets.urgency, urgency as 'minor' | 'urgent' | 'critical'));
			}
		}

		const countResult = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(supportTickets)
			.where(countConditions.length > 0 ? and(...countConditions) : undefined)
			.get();

		return NextResponse.json({
			tickets,
			total: countResult?.count || 0,
			limit,
			offset,
			hasMore: (countResult?.count || 0) > offset + limit,
		});
	} catch (error) {
		console.error("Error fetching support tickets:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
