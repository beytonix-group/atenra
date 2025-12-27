import { registry, z } from './registry';
import {
  UnauthorizedResponse,
  ValidationErrorResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
} from './common.schemas';

// ============================================================
// Auth Schemas
// ============================================================

// POST /api/auth/register
const RegisterRequestSchema = z.object({
  name: z.string().min(2).openapi({ example: 'John Doe' }),
  email: z.string().email().openapi({ example: 'john@example.com' }),
  password: z.string().min(8).openapi({ example: 'securePassword123' }),
}).openapi('RegisterRequest');

const RegisterResponseSchema = z.object({
  message: z.string().openapi({ example: 'Registration successful' }),
  user: z.object({
    id: z.number().openapi({ example: 1 }),
    email: z.string().openapi({ example: 'john@example.com' }),
    displayName: z.string().openapi({ example: 'John Doe' }),
  }),
}).openapi('RegisterResponse');

registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  summary: 'Register new user',
  description: 'Create a new user account with email and password',
  request: {
    body: {
      content: {
        'application/json': { schema: RegisterRequestSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: { 'application/json': { schema: RegisterResponseSchema } },
    },
    400: ValidationErrorResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/auth/forgot-password
const ForgotPasswordRequestSchema = z.object({
  email: z.string().email().openapi({ example: 'john@example.com' }),
}).openapi('ForgotPasswordRequest');

registry.registerPath({
  method: 'post',
  path: '/api/auth/forgot-password',
  tags: ['Auth'],
  summary: 'Request password reset',
  description: 'Send a password reset email to the specified address',
  request: {
    body: {
      content: {
        'application/json': { schema: ForgotPasswordRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Reset email sent (always returns success for security)',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'If an account exists, a password reset email has been sent' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/auth/verify-reset-token
const VerifyResetTokenRequestSchema = z.object({
  token: z.string().openapi({ example: 'abc123-token' }),
}).openapi('VerifyResetTokenRequest');

registry.registerPath({
  method: 'post',
  path: '/api/auth/verify-reset-token',
  tags: ['Auth'],
  summary: 'Verify password reset token',
  description: 'Check if a password reset token is valid and not expired',
  request: {
    body: {
      content: {
        'application/json': { schema: VerifyResetTokenRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Token is valid',
      content: {
        'application/json': {
          schema: z.object({
            valid: z.boolean().openapi({ example: true }),
            email: z.string().optional().openapi({ example: 'john@example.com' }),
          }),
        },
      },
    },
    400: {
      description: 'Invalid or expired token',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string().openapi({ example: 'Invalid or expired token' }),
          }),
        },
      },
    },
  },
});

// POST /api/auth/reset-password
const ResetPasswordRequestSchema = z.object({
  token: z.string().openapi({ example: 'abc123-token' }),
  password: z.string().min(8).openapi({ example: 'newSecurePassword123' }),
}).openapi('ResetPasswordRequest');

registry.registerPath({
  method: 'post',
  path: '/api/auth/reset-password',
  tags: ['Auth'],
  summary: 'Reset password',
  description: 'Set a new password using a valid reset token',
  request: {
    body: {
      content: {
        'application/json': { schema: ResetPasswordRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset successful',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Password has been reset successfully' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/auth/verify
const VerifyEmailRequestSchema = z.object({
  token: z.string().openapi({ example: 'verification-token-123' }),
}).openapi('VerifyEmailRequest');

registry.registerPath({
  method: 'post',
  path: '/api/auth/verify',
  tags: ['Auth'],
  summary: 'Verify email address',
  description: 'Verify user email using the token sent via email',
  request: {
    body: {
      content: {
        'application/json': { schema: VerifyEmailRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Email verified successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Email verified successfully' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    500: InternalServerErrorResponse,
  },
});

// POST /api/auth/accept-invitation
const AcceptInvitationRequestSchema = z.object({
  token: z.string().openapi({ example: 'invitation-token-123' }),
  password: z.string().min(8).optional().openapi({ example: 'securePassword123' }),
}).openapi('AcceptInvitationRequest');

registry.registerPath({
  method: 'post',
  path: '/api/auth/accept-invitation',
  tags: ['Auth'],
  summary: 'Accept company invitation',
  description: 'Accept an invitation to join a company. If user does not exist, creates account with provided password.',
  request: {
    body: {
      content: {
        'application/json': { schema: AcceptInvitationRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Invitation accepted',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string().openapi({ example: 'Invitation accepted successfully' }),
            companyId: z.number().openapi({ example: 1 }),
            companyName: z.string().openapi({ example: 'Acme Inc.' }),
          }),
        },
      },
    },
    400: ValidationErrorResponse,
    404: NotFoundResponse,
    500: InternalServerErrorResponse,
  },
});

// ============================================================
// Profile Schemas
// ============================================================

// GET /api/profile
const ProfileResponseSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  firstName: z.string().nullable().openapi({ example: 'John' }),
  lastName: z.string().nullable().openapi({ example: 'Doe' }),
  displayName: z.string().nullable().openapi({ example: 'John Doe' }),
  email: z.string().openapi({ example: 'john@example.com' }),
  phone: z.string().nullable().openapi({ example: '+1234567890' }),
  addressLine1: z.string().nullable().openapi({ example: '123 Main St' }),
  addressLine2: z.string().nullable().openapi({ example: 'Apt 4' }),
  city: z.string().nullable().openapi({ example: 'New York' }),
  state: z.string().nullable().openapi({ example: 'NY' }),
  zipCode: z.string().nullable().openapi({ example: '10001' }),
  country: z.string().nullable().openapi({ example: 'US' }),
  status: z.string().openapi({ example: 'active' }),
  emailVerified: z.number().openapi({ example: 1 }),
  createdAt: z.number().openapi({ example: 1703635200 }),
  roles: z.array(z.object({
    roleId: z.number().openapi({ example: 1 }),
    roleName: z.string().openapi({ example: 'user' }),
  })).openapi({ example: [{ roleId: 1, roleName: 'user' }] }),
}).openapi('ProfileResponse');

registry.registerPath({
  method: 'get',
  path: '/api/profile',
  tags: ['Profile'],
  summary: 'Get user profile',
  description: 'Get the authenticated user\'s profile information',
  responses: {
    200: {
      description: 'User profile',
      content: { 'application/json': { schema: ProfileResponseSchema } },
    },
    401: UnauthorizedResponse,
    404: NotFoundResponse,
    500: InternalServerErrorResponse,
  },
});

// PATCH /api/profile
const UpdateProfileRequestSchema = z.object({
  firstName: z.string().max(30).nullish().openapi({ example: 'John' }),
  lastName: z.string().max(30).nullish().openapi({ example: 'Doe' }),
  displayName: z.string().max(65).nullish().openapi({ example: 'John Doe' }),
  phone: z.string().max(20).nullish().openapi({ example: '+1234567890' }),
  addressLine1: z.string().max(50).nullish().openapi({ example: '123 Main St' }),
  addressLine2: z.string().max(50).nullish().openapi({ example: 'Apt 4' }),
  city: z.string().max(50).nullish().openapi({ example: 'New York' }),
  state: z.string().max(50).nullish().openapi({ example: 'NY' }),
  zipCode: z.string().nullish().openapi({ example: '10001' }),
  country: z.string().max(50).nullish().openapi({ example: 'US' }),
}).openapi('UpdateProfileRequest');

registry.registerPath({
  method: 'patch',
  path: '/api/profile',
  tags: ['Profile'],
  summary: 'Update user profile',
  description: 'Update the authenticated user\'s profile information',
  request: {
    body: {
      content: {
        'application/json': { schema: UpdateProfileRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Profile updated',
      content: { 'application/json': { schema: ProfileResponseSchema } },
    },
    401: UnauthorizedResponse,
    400: ValidationErrorResponse,
    500: InternalServerErrorResponse,
  },
});
