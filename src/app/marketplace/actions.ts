'use server';

import { db } from '@/server/db';
import { companies, serviceCategories, companyServiceCategories } from '@/server/db/schema';
import { eq, and, sql, desc, asc, inArray } from 'drizzle-orm';
import { getRequestContext } from '@cloudflare/next-on-pages';

export type CompanyWithCategories = typeof companies.$inferSelect & {
  categories: Array<{
    id: number;
    name: string;
  }>;
}

interface FetchCompaniesParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export async function fetchCompanies({
  page = 1,
  limit = 25,
  categoryId,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}: FetchCompaniesParams = {}) {
  const offset = (page - 1) * limit;

  try {
    // If filtering by category, first get company IDs that have this category
    let companyIds: number[] | undefined;
    if (categoryId) {
      const companiesWithCategory = await db
        .select({ companyId: companyServiceCategories.companyId })
        .from(companyServiceCategories)
        .where(eq(companyServiceCategories.categoryId, categoryId));

      companyIds = companiesWithCategory.map(c => c.companyId);

      if (companyIds.length === 0) {
        return {
          companies: [],
          totalCount: 0,
          page,
          limit,
          totalPages: 0
        };
      }
    }

    // Build the query with conditions
    const conditions = [
      eq(companies.isPublic, 1),
      eq(companies.status, 'active'),
      ...(companyIds ? [inArray(companies.id, companyIds)] : [])
    ];

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
    const allRecords = await baseQuery;

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
    let companiesArray = Array.from(companyMap.values());

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