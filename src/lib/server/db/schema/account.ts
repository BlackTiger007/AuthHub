import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const account = sqliteTable('account', {
	provider: text('provider').notNull(),
	providerUserId: text('provider_user_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	expiresAt: integer('expires_at', { mode: 'timestamp' }),
	scope: text('scope')
});

export type Account = typeof account.$inferSelect;
