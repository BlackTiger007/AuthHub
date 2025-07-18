import type { LogEvent } from '$lib/utils/events';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const log = sqliteTable('log', {
	id: text('id').primaryKey(),
	event: text('event').notNull().$type<LogEvent>(),
	userId: text('user_id').references(() => user.id), // optional, wenn eingeloggt
	ip: text('ip'),
	userAgent: text('user_agent'),
	referer: text('referer'),
	data: text('data'), // JSON-String, wenn du willst
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type Log = typeof log.$inferSelect;
