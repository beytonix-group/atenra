/**
 * Get Company Invoices Function
 *
 * Retrieves invoices for a specific company the user has access to.
 */

import { db } from '@/server/db';
import { users, companies, companyUsers, companyInvoices } from '@/server/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { isSuperAdmin } from '@/lib/auth-helpers';
import type { ChatFunction, FunctionContext } from './types';

/**
 * Normalize string for comparison - handles punctuation, spaces, quotes, case
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/["'""'']/g, '')  // Remove all quote types (straight + curly)
    .replace(/[.,]/g, '')       // Remove punctuation
    .replace(/\s+/g, ' ');      // Normalize whitespace to single space
}

/**
 * Escape LIKE wildcards for safe pattern matching
 */
function escapeLike(s: string): string {
  return s.replace(/[%_\\]/g, (m) => `\\${m}`);
}

async function handler(
  args: Record<string, unknown>,
  context: FunctionContext
): Promise<Record<string, unknown>> {
  try {
    // Defensive fallback for different argument names GPT might use
    const companyIdentifier =
      (args.companyName as string | undefined) ??
      (args.company as string | undefined) ??
      (args.name as string | undefined);

    if (!companyIdentifier) {
      return {
        message: 'Please specify a company name to fetch invoices for.',
      };
    }

    // Get user
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, context.authUserId))
      .get();

    if (!user) {
      return { error: 'User not found' };
    }

    // Check if user is super admin (can access all companies)
    const isAdmin = await isSuperAdmin().catch(() => false);

    // Normalize input for matching (with wildcard escaping)
    const normalizedInput = normalize(companyIdentifier);
    const likePattern = `%${escapeLike(normalizedInput)}%`;

    // SQL normalization: lower, trim, remove quotes/punctuation, collapse spaces
    // Must match JS normalize() function which removes: " ' " " ' '
    const normalizedDbName = sql`
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      replace(
                        replace(lower(trim(${companies.name})), '.', ''),
                      ',', ''),
                    '''', ''),
                  '"', ''),
                ''', ''),
              ''', ''),
            '"', ''),
          '"', ''),
        '  ', ' '),
      '  ', ' ')
    `;

    // Search with normalized comparison on BOTH sides
    let matchingCompanies: { id: number; name: string }[];

    if (isAdmin) {
      // Super admin can search all companies
      matchingCompanies = await db
        .select({ id: companies.id, name: companies.name })
        .from(companies)
        .where(sql`${normalizedDbName} LIKE ${likePattern} ESCAPE '\\'`)
        .all();
    } else {
      // Regular users can only search companies they're members of
      matchingCompanies = await db
        .select({ id: companies.id, name: companies.name })
        .from(companyUsers)
        .innerJoin(companies, eq(companyUsers.companyId, companies.id))
        .where(
          and(
            eq(companyUsers.userId, user.id),
            sql`${normalizedDbName} LIKE ${likePattern} ESCAPE '\\'`
          )
        )
        .all();
    }

    if (matchingCompanies.length === 0) {
      // Different message for admins vs regular users (avoid leaking company existence)
      const message = isAdmin
        ? `No company found matching "${companyIdentifier}". Please check the company name and try again.`
        : `No matching company found that you have access to. Please check the name or contact an admin if you need access.`;
      return {
        found: false,
        message,
      };
    }

    if (matchingCompanies.length > 1) {
      return {
        found: false,
        message: `Multiple companies match "${companyIdentifier}". Please be more specific.`,
        matchingCompanies: matchingCompanies.map((c) => c.name),
      };
    }

    const company = matchingCompanies[0];

    // Build date filter conditions
    const conditions = [eq(companyInvoices.companyId, company.id)];

    const dateField = args.dateField as string | undefined;
    const startDate = args.startDate as string | undefined;
    const endDate = args.endDate as string | undefined;
    const status = args.status as string | undefined;

    if (startDate) {
      const parsedStart = new Date(startDate);
      if (isNaN(parsedStart.getTime())) {
        return { error: `Invalid start date format: "${startDate}". Use ISO format (e.g., 2024-01-01).` };
      }
      const startTimestamp = Math.floor(parsedStart.getTime() / 1000);
      if (dateField === 'dueDate') {
        conditions.push(gte(companyInvoices.dueDate, startTimestamp));
      } else {
        conditions.push(gte(companyInvoices.invoiceDate, startTimestamp));
      }
    }

    if (endDate) {
      const parsedEnd = new Date(endDate);
      if (isNaN(parsedEnd.getTime())) {
        return { error: `Invalid end date format: "${endDate}". Use ISO format (e.g., 2024-12-31).` };
      }
      const endTimestamp = Math.floor(parsedEnd.getTime() / 1000);
      if (dateField === 'dueDate') {
        conditions.push(lte(companyInvoices.dueDate, endTimestamp));
      } else {
        conditions.push(lte(companyInvoices.invoiceDate, endTimestamp));
      }
    }

    if (status) {
      const validStatuses = ['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void', 'refunded'] as const;
      type InvoiceStatus = typeof validStatuses[number];
      if (validStatuses.includes(status as InvoiceStatus)) {
        conditions.push(eq(companyInvoices.status, status as InvoiceStatus));
      }
    }

    // Fetch invoices
    const invoicesList = await db
      .select({
        id: companyInvoices.id,
        invoiceNumber: companyInvoices.invoiceNumber,
        customerName: companyInvoices.customerName,
        totalCents: companyInvoices.totalCents,
        amountPaidCents: companyInvoices.amountPaidCents,
        status: companyInvoices.status,
        invoiceDate: companyInvoices.invoiceDate,
        dueDate: companyInvoices.dueDate,
        paidAt: companyInvoices.paidAt,
        description: companyInvoices.description,
      })
      .from(companyInvoices)
      .where(and(...conditions))
      .orderBy(desc(companyInvoices.invoiceDate))
      .limit(20)
      .all();

    if (invoicesList.length === 0) {
      return {
        company: company.name,
        hasInvoices: false,
        message: `${company.name} has no invoices yet.`,
        invoices: [],
      };
    }

    // Format for GPT response
    const formattedInvoices = invoicesList.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customerName,
      total: `$${(inv.totalCents / 100).toFixed(2)}`,
      paid: `$${(inv.amountPaidCents / 100).toFixed(2)}`,
      balance: `$${((inv.totalCents - inv.amountPaidCents) / 100).toFixed(2)}`,
      status: inv.status,
      invoiceDate: new Date(inv.invoiceDate * 1000).toLocaleDateString(),
      dueDate: inv.dueDate
        ? new Date(inv.dueDate * 1000).toLocaleDateString()
        : 'N/A',
      paidAt: inv.paidAt
        ? new Date(inv.paidAt * 1000).toLocaleDateString()
        : null,
      description: inv.description,
    }));

    // Calculate summary
    const totalRevenue = invoicesList.reduce(
      (sum, inv) => sum + inv.amountPaidCents,
      0
    );
    const totalOutstanding = invoicesList.reduce(
      (sum, inv) => sum + (inv.totalCents - inv.amountPaidCents),
      0
    );

    return {
      company: company.name,
      summary: {
        totalInvoices: formattedInvoices.length,
        totalRevenue: `$${(totalRevenue / 100).toFixed(2)}`,
        totalOutstanding: `$${(totalOutstanding / 100).toFixed(2)}`,
      },
      invoices: formattedInvoices,
    };
  } catch (error) {
    console.error('Error fetching company invoices:', error);
    return { error: 'Failed to fetch company invoice information' };
  }
}

export const getCompanyInvoices: ChatFunction = {
  definition: {
    name: 'get_company_invoices',
    description:
      "Get invoices for a company. ALWAYS call this function when: (1) user asks about company/business invoices, (2) user provides a company name after being asked which company, or (3) user mentions any business name in context of invoices or billing. The companyName can be partial - fuzzy matching is supported.",
    parameters: {
      type: 'object',
      properties: {
        companyName: {
          type: 'string',
          description: 'The name of the company to fetch invoices for.',
        },
        startDate: {
          type: 'string',
          description: 'Start date for filtering (ISO format, e.g., 2024-01-01). Optional.',
        },
        endDate: {
          type: 'string',
          description: 'End date for filtering (ISO format, e.g., 2024-12-31). Optional.',
        },
        dateField: {
          type: 'string',
          description: 'Which date field to filter on: "invoiceDate" (default) or "dueDate".',
          enum: ['invoiceDate', 'dueDate'],
        },
        status: {
          type: 'string',
          description: 'Filter by invoice status. Optional.',
          enum: ['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void', 'refunded'],
        },
      },
      required: ['companyName'],
    },
  },
  handler,
};
