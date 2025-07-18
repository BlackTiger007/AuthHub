import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const app = sqliteTable('app', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(),
	description: text('description'),
	clientId: text('client_id').notNull().unique(),
	clientSecret: text('client_secret'),
	redirectUri: text('redirect_uri').notNull(),
	allowedOrigins: text('allowed_origins'), // z.B. CSV oder JSON-Array als String
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export type App = typeof app.$inferSelect;
