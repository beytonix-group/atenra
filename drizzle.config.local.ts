import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle-local',
  dialect: 'sqlite',
  dbCredentials: {
    url: './local.db',
  },
});