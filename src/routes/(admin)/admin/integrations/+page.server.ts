import { settings } from '$lib/server/store.svelte';
import { Discord, GitHub, Password, SMTP } from '$lib/server/utils/settingsSchemas';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import z from 'zod';
import { saveSettings } from '$lib/server/utils/db/settings';

export const load = (async ({ url }) => {
	const { Discord, GitHub, SMTP, Password } = settings;

	return { url: url.origin, discord: Discord, github: GitHub, smtp: SMTP, password: Password };
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

		const rawData = {
			setup: true,
			host: form.get('host'),
			port: Number(form.get('port')),
			username: form.get('username'),
			password: form.get('password'),
			from: form.get('from'),
			to: form.get('to')
		};

		const parseResult = SMTP.safeParse(rawData);

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

	deleteSmtp: async () => {
		const rawData = {};

		const parseResult = SMTP.safeParse({ rawData });

		if (!parseResult.success) {
			return fail(400, {
				form: 'smtp',
				message: z.treeifyError(parseResult.error)
			});
		}
		console.log(parseResult.data);

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
		const testEmail = form.get('test') ?? '';

		if (!testEmail) {
			fail(400, { form: 'smtpTest', message: 'Keine E-Mail angegeben' });
		}

		console.log({ testEmail });

		return { success: true, form: 'smtpTest' };
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
