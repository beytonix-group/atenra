import * as schema from "./schema";

// Check if we're in edge runtime or Node.js runtime
// In local dev with 'nodejs' runtime, process will be defined
// In production with 'edge' runtime, process will be undefined or NEXT_RUNTIME will be 'edge'
const isEdgeRuntime = typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge';

let db: any;

// During local development, we should use SQLite
// The dev script changes runtime to 'nodejs' for local development
if (!isEdgeRuntime) {
  // Node.js runtime - use SQLite for local development
  console.log('Using SQLite database for local development');
  const { getSQLiteDatabase } = require("./sqlite");
  db = getSQLiteDatabase();
} else {
  // Edge runtime - this should only happen in production or when building
  console.log('Edge runtime detected, attempting to use D1');
  try {
    const { getD1Database } = require("./d1");
    db = getD1Database();
    
    // If D1 returns null, we might be building or in a context without D1
    if (!db) {
      console.warn('D1 not available in edge runtime, creating placeholder');
      // Create a dummy db that will work during build but not at runtime
      db = new Proxy({} as any, {
        get(target, prop) {
          // Allow certain operations during build
          if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete') {
            return () => ({
              from: () => ({ where: () => ({ get: () => null, all: () => [], limit: () => ({ get: () => null, all: () => [] }) }) }),
              values: () => ({ returning: () => ({ get: () => null }) }),
              set: () => ({ where: () => ({ returning: () => ({ get: () => null }) }) }),
              where: () => ({ returning: () => ({ get: () => null }), get: () => null, all: () => [] })
            });
          }
          console.warn(`Database operation '${String(prop)}' called but D1 not available`);
          return () => null;
        }
      });
    }
  } catch (error) {
    console.error('Failed to initialize D1 database:', error);
    // Create a dummy db for build time
    db = new Proxy({} as any, {
      get(target, prop) {
        if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete') {
          return () => ({
            from: () => ({ where: () => ({ get: () => null, all: () => [], limit: () => ({ get: () => null, all: () => [] }) }) }),
            values: () => ({ returning: () => ({ get: () => null }) }),
            set: () => ({ where: () => ({ returning: () => ({ get: () => null }) }) }),
            where: () => ({ returning: () => ({ get: () => null }), get: () => null, all: () => [] })
          });
        }
        return () => null;
      }
    });
  }
}

export { db };
export type { DatabaseType } from "@/types/database";