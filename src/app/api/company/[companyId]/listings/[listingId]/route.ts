import { NextResponse, NextRequest } from "next/server";
import { db } from "@/server/db";
import { companies, companyListings, type NewCompanyListing } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { hasCompanyManagementAccess } from "@/lib/auth-helpers";
import { auth } from "@/server/auth";
import { z } from "zod";

const updateListingSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less").optional(),
	description: z.string().max(2000, "Description must be 2000 characters or less").optional().nullable(),
	price: z.number().min(0, "Price must be positive").optional().nullable(),
	isActive: z.number().min(0).max(1).optional(),
	sortOrder: z.number().int().optional(),
});

// GET - Fetch a single listing
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string; listingId: string }> }
) {
	try {
		const { companyId, listingId } = await params;
		const companyIdNum = parseInt(companyId);
		const listingIdNum = parseInt(listingId);

		if (isNaN(companyIdNum) || isNaN(listingIdNum)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		// Check if user can manage - if so, return listing even if inactive
		const canManage = await hasCompanyManagementAccess(companyIdNum).catch(() => false);

		// For non-managers, verify company is public and active
		if (!canManage) {
			const company = await db
				.select()
				.from(companies)
				.where(
					and(
						eq(companies.id, companyIdNum),
						eq(companies.isPublic, 1),
						eq(companies.status, 'active')
					)
				)
				.get();

			if (!company) {
				return NextResponse.json({ error: "Company not found" }, { status: 404 });
			}
		}

		// Fetch listing with appropriate visibility
		const listing = await db
			.select()
			.from(companyListings)
			.where(
				canManage
					? and(
						eq(companyListings.id, listingIdNum),
						eq(companyListings.companyId, companyIdNum)
					)
					: and(
						eq(companyListings.id, listingIdNum),
						eq(companyListings.companyId, companyIdNum),
						eq(companyListings.isActive, 1)
					)
			)
			.get();

		if (!listing) {
			return NextResponse.json({ error: "Listing not found" }, { status: 404 });
		}

		return NextResponse.json({ listing });
	} catch (error) {
		console.error("Error fetching listing:", error);
		return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
	}
}

// PATCH - Update a listing
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string; listingId: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { companyId, listingId } = await params;
		const companyIdNum = parseInt(companyId);
		const listingIdNum = parseInt(listingId);

		if (isNaN(companyIdNum) || isNaN(listingIdNum)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		// Check if user has management privileges
		const canManage = await hasCompanyManagementAccess(companyIdNum);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden - You must be a company owner, manager, or super admin to update listings" },
				{ status: 403 }
			);
		}

		// Verify company exists
		const company = await db
			.select()
			.from(companies)
			.where(eq(companies.id, companyIdNum))
			.get();

		if (!company) {
			return NextResponse.json({ error: "Company not found" }, { status: 404 });
		}

		// Verify listing exists and belongs to this company
		const existingListing = await db
			.select()
			.from(companyListings)
			.where(
				and(
					eq(companyListings.id, listingIdNum),
					eq(companyListings.companyId, companyIdNum)
				)
			)
			.get();

		if (!existingListing) {
			return NextResponse.json({ error: "Listing not found" }, { status: 404 });
		}

		const body = await request.json();

		// Validate the request body
		const validatedData = updateListingSchema.parse(body);

		// Build update object with only provided fields
		const updateData: Partial<NewCompanyListing> = {};

		if (validatedData.title !== undefined) {
			updateData.title = validatedData.title;
		}
		if (validatedData.description !== undefined) {
			updateData.description = validatedData.description;
		}
		if (validatedData.price !== undefined) {
			updateData.price = validatedData.price;
		}
		if (validatedData.isActive !== undefined) {
			updateData.isActive = validatedData.isActive;
		}
		if (validatedData.sortOrder !== undefined) {
			updateData.sortOrder = validatedData.sortOrder;
		}

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No fields to update" }, { status: 400 });
		}

		// Update the listing
		const updatedListing = await db
			.update(companyListings)
			.set(updateData)
			.where(eq(companyListings.id, listingIdNum))
			.returning()
			.get();

		return NextResponse.json({ listing: updatedListing });
	} catch (error) {
		console.error("Error updating listing:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: "Invalid data",
					details: error.issues,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
	}
}

// DELETE - Remove a listing
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ companyId: string; listingId: string }> }
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { companyId, listingId } = await params;
		const companyIdNum = parseInt(companyId);
		const listingIdNum = parseInt(listingId);

		if (isNaN(companyIdNum) || isNaN(listingIdNum)) {
			return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
		}

		// Check if user has management privileges
		const canManage = await hasCompanyManagementAccess(companyIdNum);
		if (!canManage) {
			return NextResponse.json(
				{ error: "Forbidden - You must be a company owner, manager, or super admin to delete listings" },
				{ status: 403 }
			);
		}

		// Delete the listing (only if it belongs to the specified company)
		const deleted = await db
			.delete(companyListings)
			.where(
				and(
					eq(companyListings.id, listingIdNum),
					eq(companyListings.companyId, companyIdNum)
				)
			)
			.returning()
			.get();

		if (!deleted) {
			return NextResponse.json({ error: "Listing not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting listing:", error);
		return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
	}
}
