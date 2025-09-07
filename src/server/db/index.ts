import * as schema from "./schema";

const isEdgeRuntime = typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge';

let db: any;

if (isEdgeRuntime) {
  // Edge runtime - try to use D1, fall back to null
  try {
    const { getD1Database } = require("./d1");
    db = getD1Database();
    
    // If D1 returns null, we're in local dev with edge runtime pages
    if (!db) {
      console.warn('Edge runtime detected but D1 not available, falling back to SQLite');
      // Try to use SQLite as fallback
      try {
        const { getSQLiteDatabase } = require("./sqlite");
        db = getSQLiteDatabase();
      } catch (e) {
        console.error('SQLite also not available in edge runtime');
        // Create a dummy db that will throw meaningful errors
        db = new Proxy({} as any, {
          get(target, prop) {
            throw new Error('Database not available in edge runtime without D1 binding');
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to initialize database in edge runtime:', error);
    // Create a dummy db that will throw meaningful errors
    db = new Proxy({} as any, {
      get(target, prop) {
        throw new Error('Database initialization failed in edge runtime');
      }
    });
  }
} else {
  // Node.js runtime - use SQLite
  const { getSQLiteDatabase } = require("./sqlite");
  db = getSQLiteDatabase();
}

export { db };
export type { DatabaseType } from "@/types/database";