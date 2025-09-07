import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getD1Database() {
  try {
    // Try to get the request context for D1
    let getRequestContext: any;
    
    // Try different methods to get the context
    if (typeof globalThis !== 'undefined' && (globalThis as any).__cf_getRequestContext) {
      getRequestContext = (globalThis as any).__cf_getRequestContext;
    } else if (typeof globalThis !== 'undefined' && (globalThis as any).getRequestContext) {
      getRequestContext = (globalThis as any).getRequestContext;
    } else {
      // Module not available - might be at build time
      throw new Error('Cloudflare context not available');
    }
    
    const context = getRequestContext();
    const env = context?.env as { DATABASE?: D1Database };
    
    if (!env?.DATABASE) {
      throw new Error('D1 binding not found. Deploy to Cloudflare Pages.');
    }
    
    return drizzle(env.DATABASE, { schema, logger: true });
  } catch (error) {
    // During build time or when context is not available
    console.warn('D1 database not available:', error);
    // Return null instead of a proxy that causes issues
    return null as any;
  }
}