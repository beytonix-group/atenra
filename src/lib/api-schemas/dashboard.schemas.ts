import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
} from './common.schemas';

// ============================================================
// Dashboard Schemas
// ============================================================

// GET /api/company/{companyId}/dashboard
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/dashboard',
  tags: ['Dashboard'],
  summary: 'Dashboard overview',
  description: 'Get dashboard overview data for a company',
  request: {
    params: z.object({ companyId: z.string() }),
  },
  responses: {
    200: {
      description: 'Dashboard data',
      content: {
        'application/json': {
          schema: z.object({
            totalRevenue: z.number().openapi({ example: 50000 }),
            totalInvoices: z.number().openapi({ example: 25 }),
            pendingInvoices: z.number().openapi({ example: 5 }),
            paidInvoices: z.number().openapi({ example: 20 }),
            totalCustomers: z.number().openapi({ example: 15 }),
            totalJobs: z.number().openapi({ example: 30 }),
            completedJobs: z.number().openapi({ example: 25 }),
            recentInvoices: z.array(z.object({
              id: z.number(),
              invoiceNumber: z.string(),
              customerName: z.string().nullable(),
              total: z.number(),
              status: z.string(),
              createdAt: z.number(),
            })).openapi({ description: 'Last 5 invoices' }),
            recentJobs: z.array(z.object({
              id: z.number(),
              title: z.string(),
              customerName: z.string().nullable(),
              status: z.string(),
              createdAt: z.number(),
            })).openapi({ description: 'Last 5 jobs' }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// GET /api/company/{companyId}/dashboard/charts
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/dashboard/charts',
  tags: ['Dashboard'],
  summary: 'Dashboard chart data',
  description: 'Get chart data for dashboard visualizations',
  request: {
    params: z.object({ companyId: z.string() }),
    query: z.object({
      period: z.enum(['7d', '30d', '90d', '1y']).optional().openapi({ example: '30d' }),
    }),
  },
  responses: {
    200: {
      description: 'Chart data',
      content: {
        'application/json': {
          schema: z.object({
            revenueByMonth: z.array(z.object({
              month: z.string().openapi({ example: '2024-01' }),
              revenue: z.number().openapi({ example: 5000 }),
            })),
            invoicesByStatus: z.array(z.object({
              status: z.string().openapi({ example: 'paid' }),
              count: z.number().openapi({ example: 20 }),
            })),
            jobsByStatus: z.array(z.object({
              status: z.string().openapi({ example: 'completed' }),
              count: z.number().openapi({ example: 25 }),
            })),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// GET /api/company/{companyId}/reports/revenue
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/reports/revenue',
  tags: ['Dashboard'],
  summary: 'Revenue report',
  description: 'Get detailed revenue report with filters',
  request: {
    params: z.object({ companyId: z.string() }),
    query: z.object({
      startDate: z.coerce.number().optional().openapi({ example: 1672531200 }),
      endDate: z.coerce.number().optional().openapi({ example: 1704067200 }),
      groupBy: z.enum(['day', 'week', 'month']).optional().openapi({ example: 'month' }),
    }),
  },
  responses: {
    200: {
      description: 'Revenue report',
      content: {
        'application/json': {
          schema: z.object({
            totalRevenue: z.number().openapi({ example: 120000 }),
            invoiceCount: z.number().openapi({ example: 48 }),
            averageInvoice: z.number().openapi({ example: 2500 }),
            breakdown: z.array(z.object({
              period: z.string().openapi({ example: '2024-01' }),
              revenue: z.number().openapi({ example: 10000 }),
              invoiceCount: z.number().openapi({ example: 4 }),
            })),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});
