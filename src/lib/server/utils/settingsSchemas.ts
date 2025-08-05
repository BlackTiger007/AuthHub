import { z } from 'zod';
import { discordScopes, githubScopes } from './scopes';

export const Password = z.object({
	length: z.number().min(0).default(8),
	uppercase: z.boolean().default(true),
	lowercase: z.boolean().default(true),
	numbers: z.boolean().default(true),
	symbols: z.boolean().default(true),
	exclude: z.string().default('')
});

export const Discord = z.object({
	setup: z.boolean().default(false),
	scopes: z.array(z.enum(discordScopes)).default(['identify', 'email']),
	clientID: z.string().default(''),
	clientSecret: z.string().default('')
});

export const GitHub = z.object({
	setup: z.boolean().default(false),
	scopes: z.array(z.enum(githubScopes)).default(['user:email']),
	clientID: z.string().default(''),
	clientSecret: z.string().default('')
});

// TODO: ist das so nötig und wird alle verwendet?
export const SMTP = z.object({
	setup: z.boolean().default(false),
	host: z.string().default(''),
	port: z.number().min(0).default(587),
	user: z.base64().optional().default(undefined),
	password: z.base64().optional().default(undefined),
	secure: z.boolean().default(false),
	requireTLS: z.boolean().default(true),
	from: z.string().default(''),
	replyTo: z.string().default(''),
	subject: z.string().default(''),
	text: z.string().default(''),
	html: z.string().default('')
});
