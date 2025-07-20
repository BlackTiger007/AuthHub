import { Discord, GitHub } from 'arctic';
import { settings } from '../store.svelte';

/**
 * Gibt eine Discord-Instanz mit dynamischer Redirect-URL zurück.
 * @param origin z. B. `url.origin` aus `load` oder `event.url.origin`
 */
export function discord(origin: string) {
	return new Discord(
		settings.Discord.clientID,
		settings.Discord.clientSecret,
		origin + '/login/discord/callback'
	);
}

/**
 * Gibt eine GitHub-Instanz mit dynamischer Redirect-URL zurück.
 */
export function github(origin: string) {
	return new GitHub(
		settings.GitHub.clientID,
		settings.GitHub.clientSecret,
		origin + '/login/github/callback'
	);
}
