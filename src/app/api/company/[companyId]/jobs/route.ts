import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { hasCompanyAccess, hasCompanyManagementAccess, getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/server/db";
import { userCompanyJobs, users, serviceCategories, companyServiceCategories } from "@/server/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { z } from "zod";

const createJobSchema = z.object({
	customerId: z.number(),
	categoryId: z.number(),
	description: z.string().min(1),
	status: z.enum(['active', 'completed', 'cancelled']).default('active'),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
	startDate: z.number().optional(),
	endDate: z.number().optional(),
	notes: z.string().optional(),
	budgetCents: z.number().optional(),
	jobAddressLine1: z.string().optional(),
	jobAddressLine2: z.string().optional(),
	jobCity: z.string().optional(),
	jobState: z.string().optional(),
	jobZip: z.string().optional(),
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
		const priority = searchParams.get('priority');
		const limitParam = parseInt(searchParams.get('limit') || '50', 10);
		const offsetParam = parseInt(searchParams.get('offset') || '0', 10);
		const limit = Math.min(Math.max(isNaN(limitParam) ? 50 : limitParam, 1), 100);
		const offset = isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;
		const sortBy = searchParams.get('sortBy') || 'createdAt';
		const sortOrderParam = searchParams.get('sortOrder') || 'desc';
		const sortOrder = sortOrderParam === 'asc' ? 'asc' : 'desc';

		// Define sortable columns with a whitelist
		const sortableColumns = {
			createdAt: userCompanyJobs.createdAt,
			updatedAt: userCompanyJobs.updatedAt,
			startDate: userCompanyJobs.startDate,
			endDate: userCompanyJobs.endDate,
			status: userCompanyJobs.status,
			priority: userCompanyJobs.priority,
		} as const;
		const sortColumn = sortableColumns[sortBy as keyof typeof sortableColumns] || userCompanyJobs.createdAt;

		// Build query conditions
		const conditions = [eq(userCompanyJobs.companyId, companyIdNum)];

		if (status && ['active', 'completed', 'cancelled'].includes(status)) {
			conditions.push(eq(userCompanyJobs.status, status as 'active' | 'completed' | 'cancelled'));
		}

		if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
			conditions.push(eq(userCompanyJobs.priority, priority as 'low' | 'medium' | 'high' | 'urgent'));
		}

		// Get jobs with customer info
		const jobs = await db
			.select({
				id: userCompanyJobs.id,
				description: userCompanyJobs.description,
				status: userCompanyJobs.status,
				priority: userCompanyJobs.priority,
				startDate: userCompanyJobs.startDate,
				endDate: userCompanyJobs.endDate,
				notes: userCompanyJobs.notes,
				budgetCents: userCompanyJobs.budgetCents,
				jobAddressLine1: userCompanyJobs.jobAddressLine1,
				jobAddressLine2: userCompanyJobs.jobAddressLine2,
				jobCity: userCompanyJobs.jobCity,
				jobState: userCompanyJobs.jobState,
				jobZip: userCompanyJobs.jobZip,
				createdAt: userCompanyJobs.createdAt,
				updatedAt: userCompanyJobs.updatedAt,
				customerId: userCompanyJobs.userId,
				customerFirstName: users.firstName,
				customerLastName: users.lastName,
				customerEmail: users.email,
				categoryId: userCompanyJobs.categoryId,
				categoryName: serviceCategories.name,
			})
			.from(userCompanyJobs)
			.leftJoin(users, eq(userCompanyJobs.userId, users.id))
			.leftJoin(serviceCategories, eq(userCompanyJobs.categoryId, serviceCategories.id))
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
			.from(userCompanyJobs)
			.where(and(...conditions))
			.get();

		return NextResponse.json({
			jobs: jobs.map(job => ({
				...job,
				customerName: [job.customerFirstName, job.customerLastName].filter(Boolean).join(' ') || job.customerEmail,
			})),
			total: countResult?.count || 0,
			limit,
			offset,
			hasMore: (countResult?.count || 0) > offset + limit,
		});
	} catch (error) {
		console.error("Error fetching jobs:", error);
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
		const validatedData = createJobSchema.parse(body);

		// Validate foreign key references
		const [customer, category] = await Promise.all([
			// Verify customer exists
			db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.id, validatedData.customerId))
				.get(),
			// Verify category exists and company offers this service
			db
				.select({ id: serviceCategories.id })
				.from(serviceCategories)
				.innerJoin(
					companyServiceCategories,
					eq(serviceCategories.id, companyServiceCategories.categoryId)
				)
				.where(
					and(
						eq(serviceCategories.id, validatedData.categoryId),
						eq(companyServiceCategories.companyId, companyIdNum)
					)
				)
				.get(),
		]);

		if (!customer) {
			return NextResponse.json(
				{ error: "Customer not found" },
				{ status: 400 }
			);
		}

		if (!category) {
			return NextResponse.json(
				{ error: "Category not found or not offered by this company" },
				{ status: 400 }
			);
		}

		// Create job
		const result = await db
			.insert(userCompanyJobs)
			.values({
				companyId: companyIdNum,
				userId: validatedData.customerId,
				categoryId: validatedData.categoryId,
				description: validatedData.description,
				status: validatedData.status,
				priority: validatedData.priority,
				startDate: validatedData.startDate,
				endDate: validatedData.endDate,
				notes: validatedData.notes,
				budgetCents: validatedData.budgetCents,
				jobAddressLine1: validatedData.jobAddressLine1,
				jobAddressLine2: validatedData.jobAddressLine2,
				jobCity: validatedData.jobCity,
				jobState: validatedData.jobState,
				jobZip: validatedData.jobZip,
			})
			.returning()
			.get();

		return NextResponse.json({ job: result }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation error", details: error.issues },
				{ status: 400 }
			);
		}
		console.error("Error creating job:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
