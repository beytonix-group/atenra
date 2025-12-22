/**
 * Get Personal Invoices Function
 *
 * Retrieves the current user's personal subscription invoices
 * with optional date range filtering.
 */

import { db } from '@/server/db';
import { users, invoices, subscriptions, plans } from '@/server/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import type { ChatFunction, FunctionContext } from './types';

async function handler(
  args: Record<string, unknown>,
  context: FunctionContext
): Promise<Record<string, unknown>> {
  try {
    // Get user
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, context.authUserId))
      .get();

    if (!user) {
      return { error: 'User not found' };
    }

    // Build date filter conditions
    const conditions = [eq(invoices.userId, user.id)];

    const dateField = args.dateField as string | undefined;
    const startDate = args.startDate as string | undefined;
    const endDate = args.endDate as string | undefined;

    if (startDate) {
      const startDateTime = new Date(startDate);
      if (isNaN(startDateTime.getTime())) {
        return { error: 'Invalid startDate format. Please use ISO format (e.g., 2024-01-01).' };
      }
      const startTimestamp = Math.floor(startDateTime.getTime() / 1000);
      if (dateField === 'dueDate') {
        conditions.push(gte(invoices.dueDate, startTimestamp));
      } else {
        conditions.push(gte(invoices.createdAt, startTimestamp));
      }
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      if (isNaN(endDateTime.getTime())) {
        return { error: 'Invalid endDate format. Please use ISO format (e.g., 2024-12-31).' };
      }
      const endTimestamp = Math.floor(endDateTime.getTime() / 1000);
      if (dateField === 'dueDate') {
        conditions.push(lte(invoices.dueDate, endTimestamp));
      } else {
        conditions.push(lte(invoices.createdAt, endTimestamp));
      }
    }

    // Fetch invoices with subscription/plan info
    const userInvoices = await db
      .select({
        id: invoices.id,
        amountDue: invoices.amountDue,
        amountPaid: invoices.amountPaid,
        status: invoices.status,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
        hostedInvoiceUrl: invoices.hostedInvoiceUrl,
        planName: plans.name,
      })
      .from(invoices)
      .leftJoin(subscriptions, eq(invoices.subscriptionId, subscriptions.id))
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt))
      .limit(20)
      .all();

    if (userInvoices.length === 0) {
      return {
        message: 'No invoices found for the specified criteria.',
        invoices: [],
      };
    }

    // Format for GPT response
    const formattedInvoices = userInvoices.map((inv) => ({
      plan: inv.planName || 'Unknown Plan',
      amountDue: `$${(inv.amountDue / 100).toFixed(2)}`,
      amountPaid: `$${(inv.amountPaid / 100).toFixed(2)}`,
      status: inv.status,
      invoiceDate: new Date(inv.createdAt * 1000).toLocaleDateString(),
      dueDate: inv.dueDate
        ? new Date(inv.dueDate * 1000).toLocaleDateString()
        : 'N/A',
      paidAt: inv.paidAt
        ? new Date(inv.paidAt * 1000).toLocaleDateString()
        : null,
      viewUrl: inv.hostedInvoiceUrl,
    }));

    return {
      count: formattedInvoices.length,
      invoices: formattedInvoices,
    };
  } catch (error) {
    console.error('Error fetching personal invoices:', error);
    return { error: 'Failed to fetch invoice information' };
  }
}

export const getPersonalInvoices: ChatFunction = {
  definition: {
    name: 'get_personal_invoices',
    description:
      "Get the current user's personal subscription invoices. Use when the user asks about their invoices, billing history, or payment records. Supports optional date range filtering.",
    parameters: {
      type: 'object',
      properties: {
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
      },
      required: [],
    },
  },
  handler,
};
