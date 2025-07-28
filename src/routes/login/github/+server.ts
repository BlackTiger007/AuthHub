import { github } from '$lib/server/utils/oauth';
import { settings } from '$lib/server/store.svelte.js';
import { generateState } from 'arctic';

export function GET(event): Response {
	const state = generateState();
	const url = github(event.url.origin).createAuthorizationURL(state, settings.GitHub.scopes);

	event.cookies.set('github_oauth_state', state, {
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
