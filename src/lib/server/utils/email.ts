import { db } from '../db';
import { eq } from 'drizzle-orm';
import { user } from '../db/schema';
import nodemailer, { type Transporter } from 'nodemailer';
import { settings } from '../store.svelte';
import z from 'zod';

//
// E-Mail Utils
//

/**
 * Validiert die Formatierung und maximale Länge einer E-Mail-Adresse.
 */
export function verifyEmailInput(email: unknown): boolean {
	return typeof email === 'string' && /^.+@.+\..+$/.test(email) && email.length < 256;
}

/**
 * Prüft, ob eine E-Mail-Adresse bereits im System registriert ist.
 * Gibt `true` zurück, wenn die Adresse verfügbar ist.
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
	const result = await db.select({ count: user.id }).from(user).where(eq(user.email, email));

	return result.length === 0;
}

//
// Nodemailer Transporter
//

export function createTransporter(config: {
	host: string;
	port: number;
	secure: boolean;
	requireTLS: boolean;
	user: string;
	pass: string;
}): Transporter {
	const isSecure = config.secure && config.port === 465;

	return nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: isSecure,
		requireTLS: config.requireTLS,
		auth: {
			user: config.user,
			pass: config.pass
		},
		tls: {
			rejectUnauthorized: true
		}
	});
}

const transporter = createTransporter({
	host: settings.SMTP.host,
	port: settings.SMTP.port,
	secure: settings.SMTP.secure,
	requireTLS: settings.SMTP.requireTLS,
	user: settings.SMTP.user,
	pass: settings.SMTP.password
});

/**
 * Versendet eine E-Mail über den konfigurierten SMTP-Transport.
 */
export async function sendMail(options: {
	to: string;
	subject: string;
	html: string;
	text?: string;
	replyTo?: string;
}) {
	return transporter.sendMail({
		from: settings.SMTP.from
			? `"${settings.SMTP.from}" <${settings.SMTP.user}>`
			: settings.SMTP.user,
		to: options.to,
		replyTo: options.replyTo ?? settings.SMTP.replyTo,
		subject: options.subject,
		text: options.text,
		html: options.html
	});
}

/**
 * Überprüft die SMTP-Konfiguration auf Verbindungsfähigkeit.
 */
export function verifySMTP(): Promise<boolean> {
	return new Promise((resolve, reject) =>
		transporter.verify((error, success) => (error ? reject(error) : resolve(success)))
	);
}

//
// SMTP-Zod-Schema
//

export const SMTPSchema = z.object({
	setup: z.boolean().default(false),

	// Verbindungsdaten
	host: z.string().min(1, 'SMTP host is required'),
	port: z.number().min(1).max(65535).default(587),
	secure: z.boolean().default(false),
	requireTLS: z.boolean().default(true),

	// Authentifizierung
	user: z.email('User must be a valid email address'),
	password: z.string().min(1, 'Password is required'),

	// Absender- und Antwortadresse
	from: z.string().optional(),
	replyTo: z.email('Reply-to must be a valid email address').optional()
});
