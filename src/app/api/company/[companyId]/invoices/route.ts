import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyAccess, hasCompanyManagementAccess } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { companyInvoices, companyInvoiceLineItems } from "@/server/db/schema";
import { eq, and, desc, asc, sql, gte, lte } from "drizzle-orm";
import { z } from "zod";

const lineItemSchema = z.object({
	description: z.string().min(1),
	quantity: z.number().min(1).default(1),
	unitPriceCents: z.number(),
	totalCents: z.number(),
	categoryId: z.number().optional(),
	sortOrder: z.number().default(0),
}).refine(
	(data) => data.totalCents === data.quantity * data.unitPriceCents,
	{
		message: "totalCents must equal quantity * unitPriceCents",
		path: ["totalCents"],
	}
);

const createInvoiceSchema = z.object({
	jobId: z.number().optional(),
	invoiceNumber: z.string().min(1),
	customerName: z.string().min(1),
	customerEmail: z.string().email().optional(),
	customerPhone: z.string().optional(),
	customerAddressLine1: z.string().optional(),
	customerAddressLine2: z.string().optional(),
	customerCity: z.string().optional(),
	customerState: z.string().optional(),
	customerZip: z.string().optional(),
	subtotalCents: z.number(),
	taxRateBps: z.number().default(0),
	taxAmountCents: z.number().default(0),
	discountCents: z.number().default(0),
	totalCents: z.number(),
	amountPaidCents: z.number().default(0),
	status: z.enum(['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void', 'refunded']).default('draft'),
	invoiceDate: z.number(),
	dueDate: z.number().optional(),
	paymentProvider: z.enum(['stripe', 'paypal', 'manual', 'cash', 'check']).optional(),
	externalPaymentId: z.string().optional(),
	description: z.string().optional(),
	notes: z.string().optional(),
	terms: z.string().optional(),
	lineItems: z.array(lineItemSchema).optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { companyId } = await params;
		const companyIdNum = parseInt(companyId);

		if (isNaN(companyIdNum)) {
			return NextResponse.json(
				{ error: "Invalid company ID" },
				{ status: 400 }
			);
		}

		// Check access
		const hasAccess = await hasCompanyAccess(companyIdNum);
		if (!hasAccess) {
			return NextResponse.json(
				{ error: "Forbidden" },
				{ status: 403 }
			);
		}

		// Parse query params
		const { searchParams } = new URL(request.url);
		const status = searchParams.get('status');
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const limitParam = parseInt(searchParams.get('limit') || '50', 10);
		const offsetParam = parseInt(searchParams.get('offset') || '0', 10);
		const limit = Math.min(Math.max(isNaN(limitParam) ? 50 : limitParam, 1), 100);
		const offset = isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;
		const sortBy = searchParams.get('sortBy') || 'invoiceDate';
		const sortOrderParam = searchParams.get('sortOrder') || 'desc';
		const sortOrder = sortOrderParam === 'asc' ? 'asc' : 'desc';

		// Define sortable columns with a whitelist
		const sortableColumns = {
			invoiceDate: companyInvoices.invoiceDate,
			invoiceNumber: companyInvoices.invoiceNumber,
			customerName: companyInvoices.customerName,
			totalCents: companyInvoices.totalCents,
			status: companyInvoices.status,
			dueDate: companyInvoices.dueDate,
			createdAt: companyInvoices.createdAt,
		} as const;
		const sortColumn = sortableColumns[sortBy as keyof typeof sortableColumns] || companyInvoices.invoiceDate;

		// Build query conditions
		const conditions = [eq(companyInvoices.companyId, companyIdNum)];

		if (status) {
			const validStatuses = ['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void', 'refunded'];
			if (validStatuses.includes(status)) {
				conditions.push(eq(companyInvoices.status, status as any));
			}
		}

		if (startDate) {
			const startTs = parseInt(startDate);
			if (!isNaN(startTs)) {
				conditions.push(gte(companyInvoices.invoiceDate, startTs));
			}
		}

		if (endDate) {
			const endTs = parseInt(endDate);
			if (!isNaN(endTs)) {
				conditions.push(lte(companyInvoices.invoiceDate, endTs));
			}
		}

		// Get invoices
		const invoices = await db
			.select({
				id: companyInvoices.id,
				invoiceNumber: companyInvoices.invoiceNumber,
				jobId: companyInvoices.jobId,
				customerId: companyInvoices.customerId,
				customerName: companyInvoices.customerName,
				customerEmail: companyInvoices.customerEmail,
				customerCity: companyInvoices.customerCity,
				customerState: companyInvoices.customerState,
				subtotalCents: companyInvoices.subtotalCents,
				taxAmountCents: companyInvoices.taxAmountCents,
				discountCents: companyInvoices.discountCents,
				totalCents: companyInvoices.totalCents,
				amountPaidCents: companyInvoices.amountPaidCents,
				status: companyInvoices.status,
				invoiceDate: companyInvoices.invoiceDate,
				dueDate: companyInvoices.dueDate,
				paidAt: companyInvoices.paidAt,
				createdAt: companyInvoices.createdAt,
				updatedAt: companyInvoices.updatedAt,
			})
			.from(companyInvoices)
			.where(and(...conditions))
			.orderBy(sortOrder === 'asc'
				? asc(sortColumn)
				: desc(sortColumn)
			)
			.limit(limit)
			.offset(offset)
			.all();

		// Get total count
		const countResult = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(companyInvoices)
			.where(and(...conditions))
			.get();

		return NextResponse.json({
			invoices,
			total: countResult?.count || 0,
			limit,
			offset,
			hasMore: (countResult?.count || 0) > offset + limit,
		});
	} catch (error) {
		console.error("Error fetching invoices:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { companyId } = await params;
		const companyIdNum = parseInt(companyId);

		if (isNaN(companyIdNum)) {
			return NextResponse.json(
				{ error: "Invalid company ID" },
				{ status: 400 }
			);
		}

		// Check management access
		const canManage = await hasCompanyManagementAccess(companyIdNum);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden - Management access required" },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { lineItems, ...invoiceData } = createInvoiceSchema.parse(body);

		// Create invoice first
		// Note: D1 doesn't support Drizzle transactions, so we run sequentially
		const newInvoice = await db
			.insert(companyInvoices)
			.values({
				companyId: companyIdNum,
				...invoiceData,
				paidAt: invoiceData.status === 'paid' ? Math.floor(Date.now() / 1000) : undefined,
			})
			.returning()
			.get();

		// Create line items if provided
		if (lineItems && lineItems.length > 0) {
			try {
				await db
					.insert(companyInvoiceLineItems)
					.values(
						lineItems.map((item, index) => ({
							invoiceId: newInvoice.id,
							description: item.description,
							quantity: item.quantity,
							unitPriceCents: item.unitPriceCents,
							totalCents: item.totalCents,
							categoryId: item.categoryId,
							sortOrder: item.sortOrder || index,
						}))
					)
					.run();
			} catch (lineItemError) {
				// If line items fail, clean up the invoice
				console.error("Error creating line items, rolling back invoice:", lineItemError);
				try {
					await db.delete(companyInvoices).where(eq(companyInvoices.id, newInvoice.id)).run();
					throw lineItemError;
				} catch (rollbackError) {
					if (rollbackError === lineItemError) {
						throw lineItemError;
					}
					console.error("CRITICAL: Failed to rollback invoice after line item error. Orphaned invoice ID:", newInvoice.id, rollbackError);
					throw new Error(`Line item creation failed and rollback failed. Orphaned invoice ID: ${newInvoice.id}. Original error: ${lineItemError instanceof Error ? lineItemError.message : String(lineItemError)}`);
				}
			}
		}

		const invoice = newInvoice;

		return NextResponse.json({ invoice }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Error creating invoice:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
