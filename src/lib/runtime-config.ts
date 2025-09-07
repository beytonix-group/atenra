// Determine if we should use edge runtime
// Only use edge runtime in production (Cloudflare Pages)
// Use Node.js runtime for local development with SQLite

export const RUNTIME_CONFIG = {
  // Use edge runtime only in production builds
  runtime: process.env.NODE_ENV === 'production' ? 'edge' as const : 'nodejs' as const,
  
  // Helper to check if we're in production
  isProduction: process.env.NODE_ENV === 'production',
  
  // Helper to check if we're building for Cloudflare
  isCloudflare: process.env.CF_PAGES === '1' || process.env.NODE_ENV === 'production',
};

// Export the runtime for use in route files
export const runtime = RUNTIME_CONFIG.runtime;