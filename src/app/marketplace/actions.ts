'use server';

import { db } from '@/server/db';
import { companies, serviceCategories, companyServiceCategories, companyUsers, users, userRoles, roles, companyListings } from '@/server/db/schema';
import { eq, and, asc, inArray } from 'drizzle-orm';

export type CompanyWithCategories = typeof companies.$inferSelect & {
  categories: Array<{
    id: number;
    name: string;
  }>;
}

export type CompanyEmployee = {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  status: 'active' | 'suspended' | 'deleted';
  companyRole: 'owner' | 'manager' | 'staff';
  isDefault: number;
  invitedAt: string;
  systemRoleId: number | null;
  systemRoleName: string | null;
}

interface FetchCompaniesParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export async function fetchCompanies({
  page = 1,
  limit = 25,
  categoryId,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  search
}: FetchCompaniesParams = {}) {
  const offset = (page - 1) * limit;

  try {
    // Build conditions array
    const conditions = [
      eq(companies.isPublic, 1),
      eq(companies.status, 'active')
    ];

    // Add category filter if specified
    if (categoryId) {
      const companiesWithCategory = await db
        .select({ companyId: companyServiceCategories.companyId })
        .from(companyServiceCategories)
        .where(eq(companyServiceCategories.categoryId, categoryId));

      const companyIds = companiesWithCategory.map(c => c.companyId);

      if (companyIds.length === 0) {
        return {
          companies: [],
          totalCount: 0,
          page,
          limit,
          totalPages: 0
        };
      }

      conditions.push(inArray(companies.id, companyIds));
    }

    // Build and execute query
    const baseQuery = db
      .select({
        company: companies,
        categoryId: companyServiceCategories.categoryId,
        categoryName: serviceCategories.name,
      })
      .from(companies)
      .leftJoin(companyServiceCategories, eq(companies.id, companyServiceCategories.companyId))
      .leftJoin(serviceCategories, eq(companyServiceCategories.categoryId, serviceCategories.id))
      .where(and(...conditions));

    // Get all matching records to group them
    let allRecords = await baseQuery;

    // If search term provided, filter results
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();

      // Group records by company first
      const companyMap = new Map<number, typeof allRecords>();

      for (const record of allRecords) {
        const companyId = record.company.id;
        if (!companyMap.has(companyId)) {
          companyMap.set(companyId, []);
        }
        companyMap.get(companyId)!.push(record);
      }

      // Filter companies that match search criteria
      const filteredCompanyIds = new Set<number>();

      for (const [companyId, records] of Array.from(companyMap)) {
        const company = records[0].company;

        // Check if company fields match
        const companyMatches =
          company.name?.toLowerCase().includes(searchTerm) ||
          company.description?.toLowerCase().includes(searchTerm) ||
          company.city?.toLowerCase().includes(searchTerm) ||
          company.state?.toLowerCase().includes(searchTerm);

        // Check if any category matches
        const categoryMatches = records.some(r =>
          r.categoryName?.toLowerCase().includes(searchTerm)
        );

        if (companyMatches || categoryMatches) {
          filteredCompanyIds.add(companyId);
        }
      }

      // Filter allRecords to only include matching companies
      allRecords = allRecords.filter(r => filteredCompanyIds.has(r.company.id));
    }

    // Group by company
    const companyMap = new Map<number, CompanyWithCategories>();

    for (const record of allRecords) {
      const companyId = record.company.id;

      if (!companyMap.has(companyId)) {
        companyMap.set(companyId, {
          ...record.company,
          categories: []
        });
      }

      if (record.categoryId && record.categoryName) {
        const company = companyMap.get(companyId)!;
        if (!company.categories.some(c => c.id === record.categoryId)) {
          company.categories.push({
            id: record.categoryId,
            name: record.categoryName
          });
        }
      }
    }

    // Convert to array and sort
    const companiesArray = Array.from(companyMap.values());

    // Sort companies
    if (sortBy === 'name') {
      companiesArray.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    } else {
      companiesArray.sort((a, b) => {
        const comparison = a.createdAt - b.createdAt;
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Paginate
    const totalCount = companiesArray.length;
    const paginatedCompanies = companiesArray.slice(offset, offset + limit);

    return {
      companies: paginatedCompanies,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies');
  }
}

export async function fetchServiceCategories() {
  try {
    const categories = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        description: serviceCategories.description,
        parentId: serviceCategories.parentId,
      })
      .from(serviceCategories)
      .orderBy(asc(serviceCategories.name));

    return categories;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw new Error('Failed to fetch service categories');
  }
}

export async function fetchCompanyById(id: number) {
  try {
    // Get company with its categories
    const companyData = await db
      .select({
        company: companies,
        categoryId: companyServiceCategories.categoryId,
        categoryName: serviceCategories.name,
      })
      .from(companies)
      .leftJoin(companyServiceCategories, eq(companies.id, companyServiceCategories.companyId))
      .leftJoin(serviceCategories, eq(companyServiceCategories.categoryId, serviceCategories.id))
      .where(
        and(
          eq(companies.id, id),
          eq(companies.isPublic, 1),
          eq(companies.status, 'active')
        )
      );

    if (!companyData || companyData.length === 0) {
      return null;
    }

    // Group categories
    const company: CompanyWithCategories = {
      ...companyData[0].company,
      categories: []
    };

    for (const record of companyData) {
      if (record.categoryId && record.categoryName) {
        if (!company.categories.some(c => c.id === record.categoryId)) {
          company.categories.push({
            id: record.categoryId,
            name: record.categoryName
          });
        }
      }
    }

    return company;
  } catch (error) {
    console.error('Error fetching company:', error);
    throw new Error('Failed to fetch company details');
  }
}

export async function fetchCompanyEmployees(companyId: number): Promise<CompanyEmployee[]> {
  try {
    const employees = await db
      .select({
        userId: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        phone: users.phone,
        addressLine1: users.addressLine1,
        addressLine2: users.addressLine2,
        city: users.city,
        state: users.state,
        zipCode: users.zipCode,
        country: users.country,
        status: users.status,
        companyRole: companyUsers.role,
        isDefault: companyUsers.isDefault,
        invitedAt: companyUsers.invitedAt,
        systemRoleId: userRoles.roleId,
        systemRoleName: roles.name,
      })
      .from(companyUsers)
      .innerJoin(users, eq(companyUsers.userId, users.id))
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(companyUsers.companyId, companyId))
      .all();

    return employees as CompanyEmployee[];
  } catch (error) {
    console.error('Error fetching company employees:', error);
    throw new Error('Failed to fetch company employees');
  }
}

export type CompanyListingData = typeof companyListings.$inferSelect;

export async function fetchCompanyListings(companyId: number): Promise<CompanyListingData[]> {
  try {
    const listings = await db
      .select()
      .from(companyListings)
      .where(
        and(
          eq(companyListings.companyId, companyId),
          eq(companyListings.isActive, 1)
        )
      )
      .orderBy(asc(companyListings.sortOrder), asc(companyListings.createdAt))
      .all();

    return listings;
  } catch (error) {
    console.error('Error fetching company listings:', error);
    throw new Error('Failed to fetch company listings');
  }
}
