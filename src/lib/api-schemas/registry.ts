import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Create the registry
export const registry = new OpenAPIRegistry();

// Generate the OpenAPI document
export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Atenra Internal API',
      version: '1.0.0',
      description: 'Internal API documentation for Atenra platform. This documentation is for internal developer use only.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://atenra.com', description: 'Production' },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication and user registration' },
      { name: 'Profile', description: 'User profile management' },
      { name: 'Admin', description: 'Admin-only operations' },
      { name: 'Admin Users', description: 'User management (admin)' },
      { name: 'Admin Plans', description: 'Plan management (admin)' },
      { name: 'Billing', description: 'Subscription and payment management' },
      { name: 'PayPal', description: 'PayPal integration' },
      { name: 'Companies', description: 'Company management' },
      { name: 'Company Invoices', description: 'Company invoice operations' },
      { name: 'Company Jobs', description: 'Company job management' },
      { name: 'Company Customers', description: 'Company customer management' },
      { name: 'Dashboard', description: 'Company dashboard and reports' },
      { name: 'Messaging', description: 'Conversations and messages' },
      { name: 'Support', description: 'Support ticket system' },
      { name: 'User', description: 'User preferences and status' },
      { name: 'Misc', description: 'Miscellaneous endpoints' },
    ],
  });
}

// Re-export z for convenience
export { z };
