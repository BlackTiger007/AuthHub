import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const passkeyCredential = sqliteTable('passkey_credential', {
	id: blob('id').primaryKey().$type<Uint8Array>(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	algorithm: integer('algorithm').notNull(),
	publicKey: blob('public_key').notNull().$type<Uint8Array>()
});

export type PasskeyCredential = typeof passkeyCredential.$inferSelect;
