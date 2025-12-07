import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

function getDatabase() {
  try {
    // Edge runtime (Cloudflare) - DATABASE is a D1 binding
    return getCloudflareContext().env.DATABASE;
  } catch {
    // Node runtime - fallback for local development
    return process.env.DATABASE;
  }
}

export const db = drizzle(getDatabase(), { schema, logger: true });
