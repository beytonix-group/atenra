import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { companies, companyListings } from "@/server/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { hasCompanyManagementAccess } from "@/lib/auth-helpers";
import { auth } from "@/server/auth";
import { z } from "zod";

const createListingSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
	description: z.string().max(2000, "Description must be 2000 characters or less").optional().nullable(),
	price: z.number().min(0, "Price must be positive").optional().nullable(),
	isActive: z.number().min(0).max(1).optional(),
	sortOrder: z.number().int().optional(),
});

// GET - Fetch all active listings for a company (public)
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
	try {
		const { companyId } = await params;
		const id = parseInt(companyId);

		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
		}

		// Verify company exists and is public
		const company = await db
			.select()
			.from(companies)
			.where(
				and(
					eq(companies.id, id),
					eq(companies.isPublic, 1),
					eq(companies.status, 'active')
				)
			)
			.get();

		if (!company) {
			return NextResponse.json({ error: "Company not found" }, { status: 404 });
		}

		// Check if user can manage - if so, return all listings including inactive
		const canManage = await hasCompanyManagementAccess(id).catch(() => false);

		// Fetch listings
		const listings = await db
			.select()
			.from(companyListings)
			.where(
				canManage
					? eq(companyListings.companyId, id)
					: and(
						eq(companyListings.companyId, id),
						eq(companyListings.isActive, 1)
					)
			)
			.orderBy(asc(companyListings.sortOrder), asc(companyListings.createdAt))
			.all();

		return NextResponse.json({ listings });
	} catch (error) {
		console.error("Error fetching company listings:", error);
		return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
	}
}

// POST - Create a new listing (requires management access)
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
		const id = parseInt(companyId);

		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
		}

		// Check if user has management privileges
		const canManage = await hasCompanyManagementAccess(id);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden - You must be a company owner, manager, or super admin to create listings" },
				{ status: 403 }
			);
		}

		// Verify company exists
		const company = await db
			.select()
			.from(companies)
			.where(eq(companies.id, id))
			.get();

		if (!company) {
			return NextResponse.json({ error: "Company not found" }, { status: 404 });
		}

		const body = await request.json();

		// Validate the request body
		const validatedData = createListingSchema.parse(body);

		// Create the listing
		const newListing = await db
			.insert(companyListings)
			.values({
				companyId: id,
				title: validatedData.title,
				description: validatedData.description ?? null,
				price: validatedData.price ?? null,
				isActive: validatedData.isActive ?? 1,
				sortOrder: validatedData.sortOrder ?? 0,
			})
			.returning()
			.get();

		return NextResponse.json({ listing: newListing }, { status: 201 });
	} catch (error) {
		console.error("Error creating listing:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Invalid data",
					details: error.issues,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
	}
}
