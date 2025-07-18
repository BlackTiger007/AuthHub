import { Role } from '../../../utils/roles';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	email: text('email').unique(),
	username: text('username').notNull().unique(),
	name: text('name'),
	passwordHash: text('password_hash').notNull(),
	verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
	role: integer('role').notNull().$type<Role>().default(Role.User),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	lastLogin: integer('last_login', { mode: 'timestamp' })
});

export type User = typeof user.$inferSelect;
