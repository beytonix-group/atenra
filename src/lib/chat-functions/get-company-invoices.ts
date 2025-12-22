/**
 * Get Company Invoices Function
 *
 * Retrieves invoices for a specific company the user has access to.
 * Requires company specification and validates user authorization.
 */

import { db } from '@/server/db';
import { users, companies, companyUsers, companyInvoices } from '@/server/db/schema';
import { eq, and, gte, lte, desc, like } from 'drizzle-orm';
import { isSuperAdmin } from '@/lib/auth-helpers';
import type { ChatFunction, FunctionContext } from './types';

async function handler(
  args: Record<string, unknown>,
  context: FunctionContext
): Promise<Record<string, unknown>> {
  try {
    const companyIdentifier = args.companyName as string | undefined;

    // Get user
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, context.authUserId))
      .get();

    if (!user) {
      return { error: 'User not found' };
    }

    // If no company specified, list available companies
    if (!companyIdentifier) {
      const userCompanies = await db
        .select({ name: companies.name })
        .from(companyUsers)
        .innerJoin(companies, eq(companyUsers.companyId, companies.id))
        .where(eq(companyUsers.userId, user.id))
        .all();

      if (userCompanies.length === 0) {
        return { error: 'You are not associated with any companies.' };
      }

      return {
        error: 'Please specify which company you want to see invoices for.',
        availableCompanies: userCompanies.map((c) => c.name),
      };
    }

    // Escape LIKE wildcards in user input to prevent pattern injection
    const escapedIdentifier = companyIdentifier
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');

    // Find companies by name (fuzzy match)
    const matchingCompanies = await db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .where(like(companies.name, `%${escapedIdentifier}%`))
      .all();

    if (matchingCompanies.length === 0) {
      return { error: `Company "${companyIdentifier}" not found.` };
    }

    if (matchingCompanies.length > 1) {
      return {
        error: `Multiple companies match "${companyIdentifier}". Please be more specific.`,
        matchingCompanies: matchingCompanies.map((c) => c.name),
      };
    }

    const company = matchingCompanies[0];

    // Check authorization
    const isAdmin = await isSuperAdmin().catch(() => false);
    if (!isAdmin) {
      const membership = await db
        .select({ role: companyUsers.role })
        .from(companyUsers)
        .where(
          and(
            eq(companyUsers.userId, user.id),
            eq(companyUsers.companyId, company.id)
          )
        )
        .get();

      if (!membership) {
        return { error: `You do not have access to ${company.name}'s invoices.` };
      }
    }

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
        message: 'No invoices found for the specified criteria.',
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
      "Get invoices for a company the user manages. ALWAYS requires the company name to be specified. Use when the user asks about business invoices, company billing, revenue, or customer payments. If the user doesn't specify a company, ask them which company.",
    parameters: {
      type: 'object',
      properties: {
        companyName: {
          type: 'string',
          description: 'The name of the company to fetch invoices for. Required.',
        },
        startDate: {
          type: 'string',
          description:
            'Start date for filtering (ISO format, e.g., 2024-01-01). Optional.',
        },
        endDate: {
          type: 'string',
          description:
            'End date for filtering (ISO format, e.g., 2024-12-31). Optional.',
        },
        dateField: {
          type: 'string',
          description:
            'Which date field to filter on: "invoiceDate" (default) or "dueDate".',
          enum: ['invoiceDate', 'dueDate'],
        },
        status: {
          type: 'string',
          description: 'Filter by invoice status. Optional.',
          enum: [
            'draft',
            'sent',
            'viewed',
            'paid',
            'partial',
            'overdue',
            'void',
            'refunded',
          ],
        },
      },
      required: [],
    },
  },
  handler,
};
