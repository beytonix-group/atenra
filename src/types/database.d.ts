import type { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import type { drizzle as drizzleD1 } from "drizzle-orm/d1";
import type * as schema from "@/server/db/schema";

export type SQLiteDB = ReturnType<typeof drizzleSQLite<typeof schema>>;
export type D1DB = ReturnType<typeof drizzleD1<typeof schema>>;
export type DatabaseType = SQLiteDB | D1DB;