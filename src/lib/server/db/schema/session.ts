import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	twoFactorVerified: integer('two_factor_verified', { mode: 'boolean' }).notNull().default(false),
	lastActiveAt: integer('lastActive_at', { mode: 'timestamp' }).notNull(),
	redirectUrl: text('redirect_url'),
	stateToken: text('state_token')
});

export type Session = typeof session.$inferSelect;
