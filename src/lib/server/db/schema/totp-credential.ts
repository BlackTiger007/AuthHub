import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const totpCredential = sqliteTable('totp_credential', {
	id: integer('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	key: blob('key').notNull().$type<Uint8Array>()
});

export type TotpCredential = typeof totpCredential.$inferSelect;
