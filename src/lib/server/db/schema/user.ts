import { Role } from '../../../utils/roles';
import { sqliteTable, integer, text, blob } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	username: text('username').notNull().unique(),
	name: text('name'),
	passwordHash: text('password_hash').notNull(),
	githubId: integer('github_id'),
	discordId: text('discord_id'),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	recoveryCode: blob('recovery_code').notNull().$type<Uint8Array>(),
	role: integer('role').notNull().$type<Role>().default(Role.User),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	lastLogin: integer('last_login', { mode: 'timestamp' })
});

export type User = typeof user.$inferSelect;

export type UserAuth = typeof user.$inferSelect & {
	registeredTOTP: boolean;
	registeredSecurityKey: boolean;
	registeredPasskey: boolean;
	registered2FA: boolean;
};
