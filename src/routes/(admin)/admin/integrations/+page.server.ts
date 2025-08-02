import { settings } from '$lib/server/store.svelte';
import { Discord, GitHub, Password, SMTP } from '$lib/server/utils/settingsSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import z from 'zod';
import { saveSettings } from '$lib/server/utils/db/settings';
import { sendMail, SMTPSchema, verifyEmailInput, verifySMTP } from '$lib/server/utils/email';

export const load = (async ({ url }) => {
	const { Discord, GitHub, SMTP, Password } = settings;

	return {
		url: url.origin,
		discord: {
			...Discord,
			clientSecret: Discord.clientSecret.replace(/./g, '*')
		},
		github: {
			...GitHub,
			clientSecret: GitHub.clientSecret.replace(/./g, '*')
		},
		smtp: {
			...SMTP,
			password: SMTP.password.replace(/./g, '*')
		},
		password: Password
	};
}) satisfies PageServerLoad;

export const actions = {
	discord: async ({ request }) => {
		const form = await request.formData();

		// Scopes aus String (z.B. "identify email") in Array splitten
		const scopesRaw = form.get('scopes');
		const scopesArray =
			typeof scopesRaw === 'string'
				? scopesRaw
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined;

		// Objekt zum Validieren
		const rawData = {
			setup: true,
			scopes: scopesArray,
			clientID: form.get('clientID'),
			clientSecret: form.get('clientSecret')
		};

		const parseResult = Discord.safeParse(rawData);

		if (!parseResult.success) {
			// Fehler zurückgeben und Formular mit Fehlermeldung rendern
			return fail(400, {
				form: 'discord',
				message: z.treeifyError(parseResult.error)
			});
		}

		Object.assign(settings.Discord, parseResult.data);

		await saveSettings();

		return {
			success: true,
			form: 'discord',
			message: 'Konfiguration gespeichert'
		};
	},
	deleteDiscord: async () => {
		const rawData = {};

		const parseResult = Discord.safeParse(rawData);

		if (!parseResult.success) {
			// Fehler zurückgeben und Formular mit Fehlermeldung rendern
			return fail(400, {
				form: 'discord',
				message: z.treeifyError(parseResult.error)
			});
		}

		Object.assign(settings.Discord, parseResult.data);

		await saveSettings();

		return {
			success: true,
			form: 'discord',
			message: 'Konfiguration gelöscht'
		};
	},
	github: async ({ request }) => {
		const form = await request.formData();

		// Scopes als String (z. B. "read:user, user:email") in ein Array umwandeln
		const scopesRaw = form.get('scopes');
		const scopesArray =
			typeof scopesRaw === 'string'
				? scopesRaw
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined;

		// Rohdaten zur Validierung
		const rawData = {
			setup: true,
			scopes: scopesArray,
			clientID: form.get('clientID'),
			clientSecret: form.get('clientSecret')
		};

		const parseResult = GitHub.safeParse(rawData);

		if (!parseResult.success) {
			return fail(400, {
				form: 'github',
				message: z.treeifyError(parseResult.error)
			});
		}

		Object.assign(settings.GitHub, parseResult.data);

		await saveSettings();

		return {
			success: true,
			form: 'github',
			message: 'Konfiguration gespeichert'
		};
	},

	deleteGithub: async () => {
		const rawData = {};

		const parseResult = GitHub.safeParse(rawData);

		if (!parseResult.success) {
			return fail(400, {
				form: 'github',
				message: z.treeifyError(parseResult.error)
			});
		}

		Object.assign(settings.GitHub, parseResult.data);

		await saveSettings();

		return {
			success: true,
			form: 'github',
			message: 'Konfiguration gelöscht'
		};
	},

	smtp: async ({ request }) => {
		const form = await request.formData();

		const host = form.get('host') ?? '';
		const port = Number(form.get('port'));
		const secure = form.get('secure') === 'on' && port === 465;
		const requireTLS = form.get('requiretls') === 'on';
		const user = form.get('user') ?? '';
		const password = form.get('password') || settings.SMTP.password;
		const from = form.get('from') || undefined;
		const replyTo = form.get('replyTo') || undefined;

		const parseResult = SMTPSchema.safeParse({
			setup: true,
			host,
			port,
			secure,
			requireTLS,
			user,
			password,
			from,
			replyTo
		});

		if (!parseResult.success) {
			return fail(400, {
				form: 'smtp',
				message: z.treeifyError(parseResult.error).properties
			});
		}

		Object.assign(settings.SMTP, parseResult.data);

		await saveSettings();

		return {
			success: true,
			form: 'smtp',
			message: 'SMTP-Konfiguration gespeichert'
		};
	},

	deleteSmtp: async () => {
		const rawData = {};

		const parseResult = SMTP.safeParse({ rawData });

		if (!parseResult.success) {
			return fail(400, {
				form: 'smtp',
				message: z.treeifyError(parseResult.error)
			});
		}

		Object.assign(settings.SMTP, parseResult.data);

		await saveSettings();

		return {
			success: true,
			form: 'smtp',
			message: 'SMTP-Konfiguration gespeichert'
		};
	},

	smtpTest: async ({ request }) => {
		const form = await request.formData();
		const testEmail = form.get('test') as string;

		if (!verifyEmailInput(testEmail)) {
			fail(400, {
				form: 'smtpTest',
				message: 'Bitte gib eine gültige E-Mail-Adresse für den Testversand an.'
			});
		}

		try {
			await verifySMTP();
		} catch (error) {
			console.error('SMTP-Verbindungsfehler:', error);
			fail(400, {
				form: 'smtpTest',
				message:
					'Verbindung zum SMTP-Server fehlgeschlagen. Bitte überprüfe die SMTP-Konfiguration.'
			});
		}

		try {
			await sendMail({
				to: testEmail,
				subject: 'Test E-Mail',
				html: '<h1>Dies ist eine Test-E-Mail</h1><p>Die SMTP-Verbindung funktioniert korrekt.</p>',
				text: 'Dies ist eine Test-E-Mail. Die SMTP-Verbindung funktioniert korrekt.'
			});
		} catch (err) {
			console.error('Fehler beim Senden der Test-E-Mail:', err);
			fail(400, {
				form: 'smtpTest',
				message:
					'Die Verbindung war erfolgreich, aber der Versand der Test-E-Mail ist fehlgeschlagen. Bitte überprüfe Empfängeradresse und Absender-Einstellungen.'
			});
		}

		return {
			success: true,
			form: 'smtpTest',
			message: 'Test-E-Mail wurde erfolgreich versendet.'
		};
	},

	password: async ({ request }) => {
		const form = await request.formData();

		const rawData = {
			length: Number(form.get('length')),
			lowercase: form.get('lowercase') === 'on',
			uppercase: form.get('uppercase') === 'on',
			numbers: form.get('numbers') === 'on',
			symbols: form.get('symbols') === 'on',
			exclude: form.get('exclude') ?? ''
		};

		const parseResult = Password.safeParse(rawData);

		if (!parseResult.success) {
			return fail(400, {
				form: 'password',
				message: z.treeifyError(parseResult.error)
			});
		}

		Object.assign(settings.Password, parseResult.data);

		await saveSettings();

		return {
			success: true,
			form: 'password'
		};
	}
} satisfies Actions;
