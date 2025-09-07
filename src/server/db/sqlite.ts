import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let cachedDb: any = null;

export function getSQLiteDatabase() {
  if (!cachedDb) {
    const sqlite = new Database('./local.db');
    sqlite.pragma('journal_mode = WAL');
    cachedDb = drizzle(sqlite, { schema, logger: true });
  }
  return cachedDb;
}