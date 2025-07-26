import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const securityKeyCredential = sqliteTable('security_key_credential', {
	id: blob('id').primaryKey().$type<Uint8Array>(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	algorithm: integer('algorithm').notNull(),
	publicKey: blob('public_key').notNull().$type<Uint8Array>()
});

export type SecurityKeyCredential = typeof securityKeyCredential.$inferSelect;
