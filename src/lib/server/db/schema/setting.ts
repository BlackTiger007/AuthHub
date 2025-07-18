import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const setting = sqliteTable('setting', {
	key: text('key').primaryKey(),
	value: text('value').notNull()
});

export type Setting = typeof setting.$inferSelect;
