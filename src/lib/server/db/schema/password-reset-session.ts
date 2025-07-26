import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const passwordResetSession = sqliteTable('password_reset_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	email: text('email').notNull(),
	code: text('code').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	twoFactorVerified: integer('two_factor_verified', { mode: 'boolean' }).notNull().default(false)
});

export type PasswordResetSession = typeof passwordResetSession.$inferSelect;
