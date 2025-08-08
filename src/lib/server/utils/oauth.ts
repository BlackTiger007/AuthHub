import { Discord, GitHub } from 'arctic';
import { settings } from '../store.svelte';
import { decryptToString } from './encryption';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Gibt eine Discord-Instanz mit dynamischer Redirect-URL zurück.
 * @param origin z. B. `url.origin` aus `load` oder `event.url.origin`
 */
export function discord(origin: string) {
	return new Discord(
		decryptToString(Buffer.from(settings.Discord.clientID, 'base64')),
		decryptToString(Buffer.from(settings.Discord.clientSecret, 'base64')),
		origin + '/login/discord/callback'
	);
}

/**
 * Gibt eine GitHub-Instanz mit dynamischer Redirect-URL zurück.
 */
export function github(origin: string) {
	return new GitHub(
		decryptToString(Buffer.from(settings.GitHub.clientID, 'base64')),
		decryptToString(Buffer.from(settings.GitHub.clientSecret, 'base64')),
		origin + '/login/github/callback'
	);
}

export function getOAuthParams(event: RequestEvent) {
	const params = event.url.searchParams;
	const redirect_uri = params.get('redirect_uri');
	const state = params.get('state');
	return { redirect_uri, state };
}
