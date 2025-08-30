import { drizzle } from "drizzle-orm/d1";
import { getEnv } from "@/lib/env-edge";
import * as schema from "./schema";

export const db = drizzle(getEnv("DATABASE"), { schema, logger: true });
