import { z } from 'zod';

export const Discord = z.object({
	setup: z.boolean().default(false),
	'Client ID': z.string().default(''),
	'Client Secret': z.string().default('')
});

export const GitHub = z.object({
	setup: z.boolean().default(false),
	'Client ID': z.string().default(''),
	'Client Secret': z.string().default('')
});

export const SMTP = z.object({
	setup: z.boolean().default(false),
	host: z.string().default(''),
	port: z.number().default(587),
	username: z.string().default(''),
	password: z.string().default(''),
	from: z.string().default(''),
	to: z.string().default(''),
	subject: z.string().default(''),
	text: z.string().default(''),
	html: z.string().default('')
});

export const Password = z.object({
	length: z.number().default(8),
	uppercase: z.boolean().default(true),
	lowercase: z.boolean().default(true),
	numbers: z.boolean().default(true),
	symbols: z.boolean().default(true),
	exclude: z.string().default('')
});

export const SMS = z.object({
	setup: z.boolean().default(false),
	provider: z.string().default(''),
	apiKey: z.string().default(''),
	senderId: z.string().default('')
});
