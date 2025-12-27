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
// Admin Check
// ============================================================

// GET /api/admin/check
registry.registerPath({
  method: 'get',
  path: '/api/admin/check',
  tags: ['Admin'],
  summary: 'Check admin status',
  description: 'Check if the current user has admin privileges',
  responses: {
    200: {
      description: 'Admin status',
      content: {
        'application/json': {
          schema: z.object({
            isAdmin: z.boolean().openapi({ example: true }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
  },
});

// ============================================================
// Admin User Schemas
// ============================================================

const UserSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  email: z.string().openapi({ example: 'user@example.com' }),
  firstName: z.string().nullable().openapi({ example: 'John' }),
  lastName: z.string().nullable().openapi({ example: 'Doe' }),
  displayName: z.string().nullable().openapi({ example: 'John Doe' }),
  status: z.enum(['active', 'suspended', 'deleted']).openapi({ example: 'active' }),
  emailVerified: z.number().openapi({ example: 1 }),
  createdAt: z.number().openapi({ example: 1703635200 }),
  lastActiveAt: z.number().nullable().openapi({ example: 1703635200 }),
  roles: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).optional(),
}).openapi('AdminUser');

const CreateUserRequestSchema = z.object({
  email: z.string().email().openapi({ example: 'newuser@example.com' }),
  password: z.string().min(8).openapi({ example: 'securePassword123' }),
  firstName: z.string().optional().openapi({ example: 'John' }),
  lastName: z.string().optional().openapi({ example: 'Doe' }),
  roleId: z.number().optional().openapi({ example: 1 }),
}).openapi('CreateUserRequest');

const UpdateUserRequestSchema = z.object({
  firstName: z.string().optional().openapi({ example: 'John' }),
  lastName: z.string().optional().openapi({ example: 'Doe' }),
  displayName: z.string().optional().openapi({ example: 'John Doe' }),
  status: z.enum(['active', 'suspended', 'deleted']).optional().openapi({ example: 'active' }),
  roleId: z.number().optional().openapi({ example: 1 }),
}).openapi('UpdateUserRequest');

// GET /api/admin/users
registry.registerPath({
  method: 'get',
  path: '/api/admin/users',
  tags: ['Admin Users'],
  summary: 'List all users',
  description: 'Get paginated list of all users (admin only)',
  request: {
    query: PaginationQuerySchema.extend({
      search: z.string().optional().openapi({ example: 'john' }),
      status: z.enum(['active', 'suspended', 'deleted']).optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of users',
      content: {
        'application/json': {
          schema: z.object({
            users: z.array(UserSchema),
            total: z.number(),
            limit: z.number(),
            offset: z.number(),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// POST /api/admin/users
registry.registerPath({
  method: 'post',
  path: '/api/admin/users',
  tags: ['Admin Users'],
  summary: 'Create user',
  description: 'Create a new user account (admin only)',
  request: {
    body: {
      content: {
        'application/json': { schema: CreateUserRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'User created',
      content: { 'application/json': { schema: z.object({ user: UserSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// GET /api/admin/users/{id}
registry.registerPath({
  method: 'get',
  path: '/api/admin/users/{id}',
  tags: ['Admin Users'],
  summary: 'Get user details',
  description: 'Get detailed information about a specific user (admin only)',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '1' }),
    }),
  },
  responses: {
    200: {
      description: 'User details',
      content: { 'application/json': { schema: z.object({ user: UserSchema }) } },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// PATCH /api/admin/users/{id}
registry.registerPath({
  method: 'patch',
  path: '/api/admin/users/{id}',
  tags: ['Admin Users'],
  summary: 'Update user',
  description: 'Update user information (admin only)',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '1' }),
    }),
    body: {
      content: {
        'application/json': { schema: UpdateUserRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated',
      content: { 'application/json': { schema: z.object({ user: UserSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// DELETE /api/admin/users/{id}
registry.registerPath({
  method: 'delete',
  path: '/api/admin/users/{id}',
  tags: ['Admin Users'],
  summary: 'Delete user',
  description: 'Delete a user account (admin only)',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '1' }),
    }),
  },
  responses: {
    200: {
      description: 'User deleted',
      content: {
        'application/json': {
          schema: z.object({ message: z.string().openapi({ example: 'User deleted' }) }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// GET /api/admin/users/{id}/activities
registry.registerPath({
  method: 'get',
  path: '/api/admin/users/{id}/activities',
  tags: ['Admin Users'],
  summary: 'Get user activities',
  description: 'Get activity history for a specific user (admin only)',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '1' }),
    }),
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: 'User activities',
      content: {
        'application/json': {
          schema: z.object({
            activities: z.array(z.object({
              id: z.number(),
              action: z.string(),
              metadata: z.any().nullable(),
              createdAt: z.number(),
            })),
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

// GET /api/admin/users/activity-summary
registry.registerPath({
  method: 'get',
  path: '/api/admin/users/activity-summary',
  tags: ['Admin Users'],
  summary: 'Activity summary',
  description: 'Get aggregated activity summary across all users (admin only)',
  request: {
    query: z.object({
      days: z.coerce.number().optional().openapi({ example: 30 }),
    }),
  },
  responses: {
    200: {
      description: 'Activity summary',
      content: {
        'application/json': {
          schema: z.object({
            totalUsers: z.number(),
            activeUsers: z.number(),
            newUsers: z.number(),
            activityByDay: z.array(z.object({
              date: z.string(),
              count: z.number(),
            })),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// GET /api/admin/users/check-email
registry.registerPath({
  method: 'get',
  path: '/api/admin/users/check-email',
  tags: ['Admin Users'],
  summary: 'Check email exists',
  description: 'Check if an email address is already registered (admin only)',
  request: {
    query: z.object({
      email: z.string().email().openapi({ example: 'user@example.com' }),
    }),
  },
  responses: {
    200: {
      description: 'Email check result',
      content: {
        'application/json': {
          schema: z.object({
            exists: z.boolean().openapi({ example: false }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// GET /api/admin/roles
registry.registerPath({
  method: 'get',
  path: '/api/admin/roles',
  tags: ['Admin'],
  summary: 'List roles',
  description: 'Get list of available roles for assignment (admin only)',
  responses: {
    200: {
      description: 'List of roles',
      content: {
        'application/json': {
          schema: z.object({
            roles: z.array(z.object({
              id: z.number().openapi({ example: 1 }),
              name: z.string().openapi({ example: 'user' }),
              description: z.string().nullable().openapi({ example: 'Standard user role' }),
            })),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// ============================================================
// Admin Plan Schemas
// ============================================================

const AdminPlanSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  slug: z.string().openapi({ example: 'premium' }),
  name: z.string().openapi({ example: 'Premium Plan' }),
  description: z.string().nullable().openapi({ example: 'Full access' }),
  monthlyPriceCents: z.number().openapi({ example: 1999 }),
  yearlyPriceCents: z.number().nullable().openapi({ example: 19990 }),
  stripeMonthlyPriceId: z.string().nullable(),
  stripeYearlyPriceId: z.string().nullable(),
  paypalMonthlyPlanId: z.string().nullable(),
  paypalYearlyPlanId: z.string().nullable(),
  features: z.string().nullable(),
  isActive: z.number().openapi({ example: 1 }),
  displayOrder: z.number().openapi({ example: 1 }),
}).openapi('AdminPlan');

// GET /api/admin/plans
registry.registerPath({
  method: 'get',
  path: '/api/admin/plans',
  tags: ['Admin Plans'],
  summary: 'List all plans',
  description: 'Get list of all subscription plans (admin only)',
  responses: {
    200: {
      description: 'List of plans',
      content: {
        'application/json': {
          schema: z.object({ plans: z.array(AdminPlanSchema) }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// POST /api/admin/plans
registry.registerPath({
  method: 'post',
  path: '/api/admin/plans',
  tags: ['Admin Plans'],
  summary: 'Create plan',
  description: 'Create a new subscription plan (admin only)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            slug: z.string().openapi({ example: 'enterprise' }),
            name: z.string().openapi({ example: 'Enterprise Plan' }),
            description: z.string().optional(),
            monthlyPriceCents: z.number().openapi({ example: 9999 }),
            yearlyPriceCents: z.number().optional(),
            features: z.string().optional(),
            isActive: z.number().optional(),
            displayOrder: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Plan created',
      content: { 'application/json': { schema: z.object({ plan: AdminPlanSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// GET /api/admin/plans/{id}
registry.registerPath({
  method: 'get',
  path: '/api/admin/plans/{id}',
  tags: ['Admin Plans'],
  summary: 'Get plan',
  description: 'Get plan details (admin only)',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Plan details',
      content: { 'application/json': { schema: z.object({ plan: AdminPlanSchema }) } },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// PATCH /api/admin/plans/{id}
registry.registerPath({
  method: 'patch',
  path: '/api/admin/plans/{id}',
  tags: ['Admin Plans'],
  summary: 'Update plan',
  description: 'Update plan details (admin only)',
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            monthlyPriceCents: z.number().optional(),
            yearlyPriceCents: z.number().optional(),
            features: z.string().optional(),
            isActive: z.number().optional(),
            displayOrder: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Plan updated',
      content: { 'application/json': { schema: z.object({ plan: AdminPlanSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// DELETE /api/admin/plans/{id}
registry.registerPath({
  method: 'delete',
  path: '/api/admin/plans/{id}',
  tags: ['Admin Plans'],
  summary: 'Delete plan',
  description: 'Delete a subscription plan (admin only)',
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: 'Plan deleted',
      content: {
        'application/json': {
          schema: z.object({ message: z.string() }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    404: NotFoundResponse,
  },
});

// POST /api/admin/set-plan-price
registry.registerPath({
  method: 'post',
  path: '/api/admin/set-plan-price',
  tags: ['Admin Plans'],
  summary: 'Set plan price',
  description: 'Update pricing for a plan and sync with payment providers (admin only)',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            planId: z.number().openapi({ example: 1 }),
            monthlyPriceCents: z.number().openapi({ example: 1999 }),
            yearlyPriceCents: z.number().optional().openapi({ example: 19990 }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Price updated',
      content: { 'application/json': { schema: z.object({ plan: AdminPlanSchema }) } },
    },
    400: ValidationErrorResponse,
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
  },
});

// POST /api/admin/sync-plans-stripe
registry.registerPath({
  method: 'post',
  path: '/api/admin/sync-plans-stripe',
  tags: ['Admin Plans'],
  summary: 'Sync with Stripe',
  description: 'Synchronize all plans with Stripe products and prices (admin only)',
  responses: {
    200: {
      description: 'Sync completed',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Plans synced with Stripe' }),
            synced: z.number().openapi({ example: 3 }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/admin/paypal/sync-plans
registry.registerPath({
  method: 'post',
  path: '/api/admin/paypal/sync-plans',
  tags: ['Admin Plans'],
  summary: 'Sync with PayPal',
  description: 'Synchronize all plans with PayPal billing plans (admin only)',
  responses: {
    200: {
      description: 'Sync completed',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Plans synced with PayPal' }),
            synced: z.number().openapi({ example: 3 }),
          }),
        },
      },
    },
    401: UnauthorizedResponse,
    403: ForbiddenResponse,
    500: InternalServerErrorResponse,
  },
});
