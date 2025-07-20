import { discord } from '$lib/server/db/oauth';
import { settings } from '$lib/server/store.svelte.js';
import { generateState } from 'arctic';

export function GET(event): Response {
	const state = generateState();
	const url = discord(event.url.origin).createAuthorizationURL(
		state,
		null,
		settings.Discord.scopes
	);

	event.cookies.set('discord_oauth_state', state, {
		httpOnly: true,
		maxAge: 60 * 10,
		secure: import.meta.env.PROD,
		path: '/',
		sameSite: 'lax'
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
