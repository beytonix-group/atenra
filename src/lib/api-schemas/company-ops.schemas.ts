import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ForbiddenResponse,
  ValidationErrorResponse,
  NotFoundResponse,
  PaginationQuerySchema,
} from './common.schemas';

// ============================================================
// Company Invoice Schemas
// ============================================================

const InvoiceItemSchema = z.object({
  description: z.string().openapi({ example: 'Service rendered' }),
  quantity: z.number().openapi({ example: 1 }),
  unitPrice: z.number().openapi({ example: 10000 }),
  total: z.number().openapi({ example: 10000 }),
}).openapi('InvoiceItem');

const CompanyInvoiceSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  invoiceNumber: z.string().openapi({ example: 'INV-2024-0001' }),
  companyId: z.number().openapi({ example: 1 }),
  customerId: z.number().nullable().openapi({ example: 1 }),
  customerName: z.string().nullable().openapi({ example: 'John Doe' }),
  customerEmail: z.string().nullable().openapi({ example: 'john@example.com' }),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'canceled']).openapi({ example: 'draft' }),
  issueDate: z.number().openapi({ example: 1703635200 }),
  dueDate: z.number().openapi({ example: 1706313600 }),
  subtotal: z.number().openapi({ example: 10000 }),
  taxRate: z.number().nullable().openapi({ example: 8.25 }),
  taxAmount: z.number().nullable().openapi({ example: 825 }),
  total: z.number().openapi({ example: 10825 }),
  notes: z.string().nullable(),
  items: z.array(InvoiceItemSchema).optional(),
  createdAt: z.number().openapi({ example: 1703635200 }),
}).openapi('CompanyInvoice');

// GET /api/company/{companyId}/invoices
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/invoices',
  tags: ['Company Invoices'],
  summary: 'List company invoices',
  description: 'Get paginated list of invoices for a company',
  request: {
    params: z.object({ companyId: z.string() }),
    query: PaginationQuerySchema.extend({
      status: z.enum(['draft', 'sent', 'paid', 'overdue', 'canceled']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of invoices',
      content: {
        'application/json': {
          schema: z.object({
            invoices: z.array(CompanyInvoiceSchema),
            total: z.number(),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// POST /api/company/{companyId}/invoices
registry.registerPath({
  method: 'post',
  path: '/api/company/{companyId}/invoices',
  tags: ['Company Invoices'],
  summary: 'Create invoice',
  description: 'Create a new invoice for the company',
  request: {
    params: z.object({ companyId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            customerId: z.number().optional(),
            customerName: z.string().optional(),
            customerEmail: z.string().email().optional(),
            issueDate: z.number(),
            dueDate: z.number(),
            taxRate: z.number().optional(),
            notes: z.string().optional(),
            items: z.array(z.object({
              description: z.string(),
              quantity: z.number(),
              unitPrice: z.number(),
            })),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Invoice created',
      content: { 'application/json': { schema: z.object({ invoice: CompanyInvoiceSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// GET /api/company/{companyId}/invoices/{invoiceId}
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/invoices/{invoiceId}',
  tags: ['Company Invoices'],
  summary: 'Get invoice',
  description: 'Get invoice details',
  request: {
    params: z.object({
      companyId: z.string(),
      invoiceId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Invoice details',
      content: { 'application/json': { schema: z.object({ invoice: CompanyInvoiceSchema }) } },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// PATCH /api/company/{companyId}/invoices/{invoiceId}
registry.registerPath({
  method: 'patch',
  path: '/api/company/{companyId}/invoices/{invoiceId}',
  tags: ['Company Invoices'],
  summary: 'Update invoice',
  description: 'Update invoice status or details',
  request: {
    params: z.object({
      companyId: z.string(),
      invoiceId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.enum(['draft', 'sent', 'paid', 'overdue', 'canceled']).optional(),
            notes: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Invoice updated',
      content: { 'application/json': { schema: z.object({ invoice: CompanyInvoiceSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// GET /api/company/{companyId}/next-invoice-number
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/next-invoice-number',
  tags: ['Company Invoices'],
  summary: 'Get next invoice number',
  description: 'Get the next available invoice number for a company',
  request: {
    params: z.object({ companyId: z.string() }),
  },
  responses: {
    200: {
      description: 'Next invoice number',
      content: {
        'application/json': {
          schema: z.object({
            nextInvoiceNumber: z.string().openapi({ example: 'INV-2024-0042' }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// ============================================================
// Company Job Schemas
// ============================================================

const JobSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  companyId: z.number().openapi({ example: 1 }),
  title: z.string().openapi({ example: 'Kitchen Remodel' }),
  description: z.string().nullable(),
  customerId: z.number().nullable(),
  customerName: z.string().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'canceled']).openapi({ example: 'pending' }),
  scheduledDate: z.number().nullable(),
  completedDate: z.number().nullable(),
  estimatedAmount: z.number().nullable(),
  actualAmount: z.number().nullable(),
  createdAt: z.number(),
}).openapi('Job');

// GET /api/company/{companyId}/jobs
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/jobs',
  tags: ['Company Jobs'],
  summary: 'List jobs',
  description: 'Get list of jobs for a company',
  request: {
    params: z.object({ companyId: z.string() }),
    query: PaginationQuerySchema.extend({
      status: z.enum(['pending', 'in_progress', 'completed', 'canceled']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of jobs',
      content: {
        'application/json': {
          schema: z.object({ jobs: z.array(JobSchema), total: z.number() }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// POST /api/company/{companyId}/jobs
registry.registerPath({
  method: 'post',
  path: '/api/company/{companyId}/jobs',
  tags: ['Company Jobs'],
  summary: 'Create job',
  description: 'Create a new job for the company',
  request: {
    params: z.object({ companyId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string(),
            description: z.string().optional(),
            customerId: z.number().optional(),
            scheduledDate: z.number().optional(),
            estimatedAmount: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Job created',
      content: { 'application/json': { schema: z.object({ job: JobSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// ============================================================
// Company Customer Schemas
// ============================================================

const CustomerSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  companyId: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'John Doe' }),
  email: z.string().nullable().openapi({ example: 'john@example.com' }),
  phone: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipCode: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.number(),
}).openapi('Customer');

// GET /api/company/{companyId}/customers
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/customers',
  tags: ['Company Customers'],
  summary: 'List customers',
  description: 'Get list of customers for a company',
  request: {
    params: z.object({ companyId: z.string() }),
    query: PaginationQuerySchema.extend({
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of customers',
      content: {
        'application/json': {
          schema: z.object({ customers: z.array(CustomerSchema), total: z.number() }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// POST /api/company/{companyId}/customers
registry.registerPath({
  method: 'post',
  path: '/api/company/{companyId}/customers',
  tags: ['Company Customers'],
  summary: 'Create customer',
  description: 'Create a new customer for the company',
  request: {
    params: z.object({ companyId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            addressLine1: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            notes: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Customer created',
      content: { 'application/json': { schema: z.object({ customer: CustomerSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// ============================================================
// Company Category Schemas
// ============================================================

const CategorySchema = z.object({
  id: z.number().openapi({ example: 1 }),
  companyId: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'Plumbing' }),
  description: z.string().nullable(),
  isActive: z.number().openapi({ example: 1 }),
}).openapi('ServiceCategory');

// GET /api/company/{companyId}/categories
registry.registerPath({
  method: 'get',
  path: '/api/company/{companyId}/categories',
  tags: ['Companies'],
  summary: 'List service categories',
  description: 'Get service categories for a company',
  request: {
    params: z.object({ companyId: z.string() }),
  },
  responses: {
    200: {
      description: 'List of categories',
      content: {
        'application/json': {
          schema: z.object({ categories: z.array(CategorySchema) }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// POST /api/company/{companyId}/categories
registry.registerPath({
  method: 'post',
  path: '/api/company/{companyId}/categories',
  tags: ['Companies'],
  summary: 'Create service category',
  description: 'Create a new service category for the company',
  request: {
    params: z.object({ companyId: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            description: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Category created',
      content: { 'application/json': { schema: z.object({ category: CategorySchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});
