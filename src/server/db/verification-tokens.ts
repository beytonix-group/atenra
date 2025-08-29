import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull(),
	token: text('token').notNull().unique(),
	expires: integer('expires').notNull(), // Unix timestamp
	createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});