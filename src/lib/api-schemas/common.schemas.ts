import { registry, z } from './registry';

// ============================================================
// Common Response Schemas
// ============================================================

export const ErrorResponseSchema = registry.register(
  'ErrorResponse',
  z.object({
    error: z.string().openapi({ example: 'Unauthorized' }),
    details: z.array(z.object({
      code: z.string().optional(),
      message: z.string(),
      path: z.array(z.string()).optional(),
    })).optional().openapi({ description: 'Validation error details' }),
  }).openapi({ description: 'Standard error response' })
);

export const SuccessMessageSchema = registry.register(
  'SuccessMessage',
  z.object({
    message: z.string().openapi({ example: 'Operation completed successfully' }),
  }).openapi({ description: 'Simple success message response' })
);

// ============================================================
// Pagination Schemas
// ============================================================

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50).openapi({
    example: 50,
    description: 'Number of items per page (max 100)'
  }),
  offset: z.coerce.number().min(0).default(0).openapi({
    example: 0,
    description: 'Number of items to skip'
  }),
}).openapi('PaginationQuery');

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T, name: string) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().openapi({ example: 100 }),
    limit: z.number().openapi({ example: 50 }),
    offset: z.number().openapi({ example: 0 }),
    hasMore: z.boolean().openapi({ example: true }),
  }).openapi(`Paginated${name}Response`);

// ============================================================
// Common Entity Schemas
// ============================================================

export const TimestampSchema = z.object({
  createdAt: z.number().openapi({ example: 1703635200, description: 'Unix timestamp' }),
  updatedAt: z.number().openapi({ example: 1703635200, description: 'Unix timestamp' }),
});

export const UserBasicSchema = registry.register(
  'UserBasic',
  z.object({
    id: z.number().openapi({ example: 1 }),
    email: z.string().email().openapi({ example: 'user@example.com' }),
    displayName: z.string().nullable().openapi({ example: 'John Doe' }),
    firstName: z.string().nullable().openapi({ example: 'John' }),
    lastName: z.string().nullable().openapi({ example: 'Doe' }),
    avatarUrl: z.string().nullable().openapi({ example: 'https://example.com/avatar.jpg' }),
  }).openapi({ description: 'Basic user information' })
);

export const CompanyBasicSchema = registry.register(
  'CompanyBasic',
  z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: 'Acme Inc.' }),
  }).openapi({ description: 'Basic company information' })
);

// ============================================================
// Common Response Helpers
// ============================================================

export const UnauthorizedResponse = {
  description: 'Unauthorized - authentication required',
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
    },
  },
};

export const ForbiddenResponse = {
  description: 'Forbidden - insufficient permissions',
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
    },
  },
};

export const NotFoundResponse = {
  description: 'Resource not found',
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
    },
  },
};

export const ValidationErrorResponse = {
  description: 'Validation error',
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
    },
  },
};

export const InternalServerErrorResponse = {
  description: 'Internal server error',
  content: {
    'application/json': {
      schema: ErrorResponseSchema,
    },
  },
};
