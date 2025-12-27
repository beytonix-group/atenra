import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ForbiddenResponse,
  ValidationErrorResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
} from './common.schemas';

// ============================================================
// Company Schemas
// ============================================================

const CompanySchema = z.object({
  id: z.number().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'Acme Inc.' }),
  slug: z.string().openapi({ example: 'acme-inc' }),
  description: z.string().nullable().openapi({ example: 'A great company' }),
  website: z.string().nullable().openapi({ example: 'https://acme.com' }),
  phone: z.string().nullable().openapi({ example: '+1234567890' }),
  email: z.string().nullable().openapi({ example: 'contact@acme.com' }),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipCode: z.string().nullable(),
  country: z.string().nullable(),
  createdAt: z.number().openapi({ example: 1703635200 }),
}).openapi('Company');

const EmployeeSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  userId: z.number().openapi({ example: 1 }),
  companyId: z.number().openapi({ example: 1 }),
  roleId: z.number().openapi({ example: 2 }),
  roleName: z.string().openapi({ example: 'manager' }),
  user: z.object({
    email: z.string(),
    displayName: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
  }),
}).openapi('Employee');

const InvitationSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  email: z.string().openapi({ example: 'invite@example.com' }),
  roleId: z.number().openapi({ example: 2 }),
  roleName: z.string().openapi({ example: 'employee' }),
  status: z.enum(['pending', 'accepted', 'expired']).openapi({ example: 'pending' }),
  expiresAt: z.number().openapi({ example: 1704240000 }),
  createdAt: z.number().openapi({ example: 1703635200 }),
}).openapi('Invitation');

// GET /api/companies
registry.registerPath({
  method: 'get',
  path: '/api/companies',
  tags: ['Companies'],
  summary: 'List companies',
  description: 'Get list of companies the user has access to',
  responses: {
    200: {
      description: 'List of companies',
      content: {
        'application/json': {
          schema: z.object({ companies: z.array(CompanySchema) }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// POST /api/companies
registry.registerPath({
  method: 'post',
  path: '/api/companies',
  tags: ['Companies'],
  summary: 'Create company',
  description: 'Create a new company',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().openapi({ example: 'My Company' }),
            description: z.string().optional(),
            website: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Company created',
      content: { 'application/json': { schema: z.object({ company: CompanySchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
  },
});

// GET /api/companies/{id}/employees
registry.registerPath({
  method: 'get',
  path: '/api/companies/{id}/employees',
  tags: ['Companies'],
  summary: 'Get company employees',
  description: 'Get list of employees for a company',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'List of employees',
      content: {
        'application/json': {
          schema: z.object({ employees: z.array(EmployeeSchema) }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// GET /api/companies/{id}/invitations
registry.registerPath({
  method: 'get',
  path: '/api/companies/{id}/invitations',
  tags: ['Companies'],
  summary: 'List invitations',
  description: 'Get pending invitations for a company',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'List of invitations',
      content: {
        'application/json': {
          schema: z.object({ invitations: z.array(InvitationSchema) }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// POST /api/companies/{id}/invitations
registry.registerPath({
  method: 'post',
  path: '/api/companies/{id}/invitations',
  tags: ['Companies'],
  summary: 'Create invitation',
  description: 'Invite a user to join the company',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email().openapi({ example: 'newemployee@example.com' }),
            roleId: z.number().openapi({ example: 2 }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Invitation sent',
      content: { 'application/json': { schema: z.object({ invitation: InvitationSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// GET /api/user/owned-companies
registry.registerPath({
  method: 'get',
  path: '/api/user/owned-companies',
  tags: ['Companies'],
  summary: 'Get owned companies',
  description: 'Get companies owned by the current user',
  responses: {
    200: {
      description: 'Owned companies',
      content: {
        'application/json': {
          schema: z.object({ companies: z.array(CompanySchema) }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});
