import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  ...(process.env.NODE_ENV === "production"
    ? {
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID!,
          databaseId: process.env.DATABASE!,
          token: process.env.CLOUDFLARE_D1_API_TOKEN!,
        },
      }
    : {
        dbCredentials: {
          url: "./local.db",
        },
      }),
});