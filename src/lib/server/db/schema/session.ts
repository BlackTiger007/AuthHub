import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	lastActiveAt: integer('lastActive_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
