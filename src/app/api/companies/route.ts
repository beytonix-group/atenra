import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { checkSuperAdmin } from "@/lib/auth-helpers";
import { getCloudflareContext } from "@opennextjs/cloudflare";


interface CreateCompanyRequest {
	name: string;
	einNumber: string;
	description?: string;
	websiteUrl?: string;
	logoUrl?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
	phone?: string;
	email?: string;
	status?: string;
	licenseNumber?: string;
	insuranceNumber?: string;
	isPublic?: boolean;
	memo?: string;
	categoryIds?: number[];
}

/**
 * POST /api/companies
 * Create a new company (Super Admin only)
 */
export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		const adminCheck = await checkSuperAdmin();

		if (!adminCheck.isAuthorized) {
			return adminCheck.response || NextResponse.json(
				{ error: adminCheck.error || "Unauthorized" },
				{ status: 403 }
			);
		}

		const env = getCloudflareContext().env;
		const db = env.DATABASE as D1Database;

		const body = await request.json() as CreateCompanyRequest;
		const {
			name,
			einNumber,
			description,
			websiteUrl,
			logoUrl,
			addressLine1,
			addressLine2,
			city,
			state,
			zipCode,
			country,
			phone,
			email,
			status,
			licenseNumber,
			insuranceNumber,
			isPublic,
			memo,
			categoryIds = [],
		} = body;

		// Validate required fields
		if (!name) {
			return NextResponse.json(
				{ error: "Company name is required" },
				{ status: 400 }
			);
		}

		if (!einNumber) {
			return NextResponse.json(
				{ error: "EIN number is required" },
				{ status: 400 }
			);
		}

		// Validate EIN format (XX-XXXXXXX)
		const einPattern = /^\d{2}-\d{7}$/;
		if (!einPattern.test(einNumber)) {
			return NextResponse.json(
				{ error: "EIN must be in format XX-XXXXXXX (9 digits)" },
				{ status: 400 }
			);
		}

		// Generate slug from name
		let baseSlug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");

		// Ensure slug is unique by appending a number if necessary
		let slug = baseSlug;
		let counter = 1;
		let existingCompany = await db
			.prepare("SELECT id FROM companies WHERE slug = ?")
			.bind(slug)
			.first();

		while (existingCompany) {
			slug = `${baseSlug}-${counter}`;
			counter++;
			existingCompany = await db
				.prepare("SELECT id FROM companies WHERE slug = ?")
				.bind(slug)
				.first();
		}

		// Get user's database ID
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "User session not found" },
				{ status: 401 }
			);
		}

		const user = await db
			.prepare("SELECT id FROM users WHERE auth_user_id = ?")
			.bind(session.user.id)
			.first<{ id: number }>();

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		const now = Math.floor(Date.now() / 1000);

		// Insert company
		const companyResult = await db
			.prepare(
				`
				INSERT INTO companies (
					name,
					ein_number,
					slug,
					description,
					website_url,
					logo_url,
					address_line1,
					address_line2,
					city,
					state,
					zip_code,
					country,
					phone,
					email,
					status,
					license_number,
					insurance_number,
					is_public,
					memo,
					created_by_user_id,
					created_at,
					updated_at
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`
			)
			.bind(
				name,
				einNumber,
				slug,
				description || null,
				websiteUrl || null,
				logoUrl || null,
				addressLine1 || null,
				addressLine2 || null,
				city || null,
				state || null,
				zipCode || null,
				country || "US",
				phone || null,
				email || null,
				status || "active",
				licenseNumber || null,
				insuranceNumber || null,
				isPublic ? 1 : 0,
				memo || null,
				user.id,
				now,
				now
			)
			.run();

		const companyId = companyResult.meta.last_row_id;

		// Insert company-category relationships
		if (categoryIds.length > 0) {
			const categoryInserts = categoryIds.map((categoryId: number) =>
				db
					.prepare(
						`
						INSERT INTO company_service_categories (company_id, category_id, created_at)
						VALUES (?, ?, ?)
					`
					)
					.bind(companyId, categoryId, now)
					.run()
			);

			await Promise.all(categoryInserts);
		}

		// Log activity
		await db
			.prepare(
				`
				INSERT INTO user_activities (user_id, activity_type, description, metadata, created_at)
				VALUES (?, ?, ?, ?, ?)
			`
			)
			.bind(
				user.id,
				"company_created",
				`Created company: ${name}`,
				JSON.stringify({
					companyId,
					companyName: name,
					companySlug: slug,
				}),
				now
			)
			.run();

		return NextResponse.json(
			{
				success: true,
				companyId,
				slug,
				message: "Company created successfully",
			},
			{ status: 201 }
		);
	} catch (error: unknown) {
		console.error("Error creating company:", error);
		return NextResponse.json(
			{
				error: "Failed to create company",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
