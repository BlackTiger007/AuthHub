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

export const SMTP = z.object({
	setup: z.boolean().default(false),
	host: z.string().default(''),
	port: z.number().min(0).default(587),
	username: z.string().default(''),
	password: z.string().default(''),
	from: z.string().default(''),
	to: z.string().default(''),
	subject: z.string().default(''),
	text: z.string().default(''),
	html: z.string().default('')
});
