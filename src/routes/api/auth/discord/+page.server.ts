import { settings } from '$lib/server/store.svelte';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ url }) => {
	// https://discord.com/oauth2/authorize?client_id=1391023167686049903&response_type=code&redirect_uri=https%3A%2F%2Fauth.webretter.com%2Fcallback%2F263w7qipev6qv2g6nv9lf&scope=identify+email

	const authUrl = new URL('https://discord.com/oauth2/authorize');
	authUrl.searchParams.set('client_id', settings.Discord.clientID);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('redirect_uri', url.origin + '/callback/discord');
	authUrl.searchParams.set('scope', settings.Discord.scopes.join(' '));

	return redirect(302, authUrl.toString());
}) satisfies PageServerLoad;
