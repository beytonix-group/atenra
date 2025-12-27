import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ForbiddenResponse,
  ValidationErrorResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
  PaginationQuerySchema,
} from './common.schemas';

// ============================================================
// Support Ticket Schemas
// ============================================================

const TicketSchema = z.object({
  id: z.string().openapi({ example: 'ABC123', description: '6-character alphanumeric ID' }),
  subject: z.string().openapi({ example: 'Cannot access billing page' }),
  description: z.string().openapi({ example: '<p>When I click on billing...</p>' }),
  urgency: z.enum(['minor', 'urgent', 'critical']).openapi({ example: 'urgent' }),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).openapi({ example: 'open' }),
  adminResponse: z.string().nullable().openapi({ example: 'We are looking into this issue.' }),
  userId: z.number().openapi({ example: 1 }),
  userName: z.string().nullable().openapi({ example: 'John Doe' }),
  userEmail: z.string().openapi({ example: 'john@example.com' }),
  companyId: z.number().nullable().openapi({ example: 1 }),
  companyName: z.string().nullable().openapi({ example: 'Acme Inc.' }),
  assignedToUserId: z.number().nullable().openapi({ example: 5 }),
  internalNotes: z.string().nullable().openapi({ description: 'Only visible to admins' }),
  createdAt: z.number().openapi({ example: 1703635200 }),
  updatedAt: z.number().openapi({ example: 1703635200 }),
  resolvedAt: z.number().nullable().openapi({ example: null }),
}).openapi('SupportTicket');

const CreateTicketRequestSchema = z.object({
  subject: z.string().min(5).max(200).openapi({ example: 'Cannot access billing page' }),
  description: z.string().min(10).max(5000).openapi({ example: 'When I click on billing, I get a 403 error...' }),
  urgency: z.enum(['minor', 'urgent', 'critical']).openapi({ example: 'urgent' }),
  companyId: z.number().optional().openapi({ example: 1 }),
}).openapi('CreateTicketRequest');

const UpdateTicketRequestSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional().openapi({ example: 'in_progress' }),
  assignedToUserId: z.number().nullable().optional().openapi({ example: 5 }),
  internalNotes: z.string().max(10000).nullable().optional(),
  adminResponse: z.string().max(10000).nullable().optional().openapi({ example: 'We are looking into this.' }),
}).openapi('UpdateTicketRequest');

// GET /api/support/tickets
registry.registerPath({
  method: 'get',
  path: '/api/support/tickets',
  tags: ['Support'],
  summary: 'List tickets',
  description: 'Get list of support tickets. Users see their own tickets, admins see all.',
  request: {
    query: PaginationQuerySchema.extend({
      status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
      urgency: z.enum(['minor', 'urgent', 'critical']).optional(),
      sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'urgency', 'subject']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of tickets',
      content: {
        'application/json': {
          schema: z.object({
            tickets: z.array(TicketSchema),
            total: z.number(),
            limit: z.number(),
            offset: z.number(),
            hasMore: z.boolean(),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/support/tickets
registry.registerPath({
  method: 'post',
  path: '/api/support/tickets',
  tags: ['Support'],
  summary: 'Create ticket',
  description: 'Create a new support ticket',
  request: {
    body: {
      content: {
        'application/json': { schema: CreateTicketRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Ticket created',
      content: { 'application/json': { schema: z.object({ ticket: TicketSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    404: NotFoundResponse,
    500: InternalServerErrorResponse,
  },
});

// GET /api/support/tickets/{id}
registry.registerPath({
  method: 'get',
  path: '/api/support/tickets/{id}',
  tags: ['Support'],
  summary: 'Get ticket',
  description: 'Get ticket details. Users can only view their own tickets.',
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'ABC123', description: '6-character ticket ID' }),
    }),
  },
  responses: {
    200: {
      description: 'Ticket details',
      content: {
        'application/json': {
          schema: z.object({
            ticket: TicketSchema,
            assignedUser: z.object({
              id: z.number(),
              displayName: z.string().nullable(),
              email: z.string(),
            }).nullable(),
          }),
        },
      },
    },
    400: {
      description: 'Invalid ticket ID format',
      content: {
        'application/json': {
          schema: z.object({ error: z.string().openapi({ example: 'Invalid ticket ID format' }) }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: InternalServerErrorResponse,
  },
});

// PATCH /api/support/tickets/{id}
registry.registerPath({
  method: 'patch',
  path: '/api/support/tickets/{id}',
  tags: ['Support'],
  summary: 'Update ticket',
  description: 'Update ticket status, assignment, or notes (admin only)',
  request: {
    params: z.object({
      id: z.string().openapi({ example: 'ABC123' }),
    }),
    body: {
      content: {
        'application/json': { schema: UpdateTicketRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Ticket updated',
      content: { 'application/json': { schema: z.object({ ticket: TicketSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
    500: InternalServerErrorResponse,
  },
});
