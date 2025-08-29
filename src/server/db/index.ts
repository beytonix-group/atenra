import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import * as schema from "./schema";

// Use different database connection based on runtime
const isEdgeRuntime = typeof EdgeRuntime !== "undefined";

export const db = isEdgeRuntime 
  ? drizzle(process.env.DATABASE, { schema, logger: true })
  : drizzleLibsql(createClient({ 
      url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/a3048712029337127504209082f254ea5fd9cea6f17a363674773c1ee3422c4f.sqlite"
    }), { schema, logger: true });
