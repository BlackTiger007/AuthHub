import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import { settings } from '$lib/server/store.svelte';
import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { and } from 'drizzle-orm';

type DiscordAuthResponse = {
	token_type: 'Bearer';
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
};

type DiscordUser = {
	id: string;
	username: string;
	avatar: string;
	discriminator: '0';
	public_flags: number;
	flags: number;
	banner: null | string;
	accent_color: number;
	global_name: string;
	avatar_decoration_data: null;
	collectibles: null;
	display_name_styles: null;
	banner_color: string;
	clan: {
		identity_guild_id: string;
		identity_enabled: boolean;
		tag: string;
		badge: string;
	};
	primary_guild: {
		identity_guild_id: string;
		identity_enabled: boolean;
		tag: string;
		badge: string;
	};
	mfa_enabled: boolean;
	locale: string;
	premium_type: number;
	email: string;
	verified: boolean;
};

export const GET: RequestHandler = async ({ url, fetch }) => {
	const code = url.searchParams.get('code');
	if (!code) {
		return new Response('Code fehlt', { status: 400 });
	}

	const body = new URLSearchParams({
		client_id: settings.Discord.clientID,
		client_secret: settings.Discord.clientSecret,
		grant_type: 'authorization_code',
		code,
		redirect_uri: url.origin + '/callback/discord'
	});

	const res = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body
	});

	if (!res.ok) {
		console.error(await res.text());
		return new Response('Fehler beim Token-Tausch', { status: 500 });
	}

	const data = (await res.json()) as DiscordAuthResponse;

	// Userdaten holen
	const userRes = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${data.access_token}`
		}
	});

	if (!userRes.ok) {
		console.error(await userRes.text());
		return new Response('Fehler beim Abrufen der Userdaten', { status: 500 });
	}

	const discordUser = (await userRes.json()) as DiscordUser;
	console.log(discordUser);

	const accountInDb = db
		.select({
			user: schema.user,
			account: schema.account
		})
		.from(schema.account)
		.innerJoin(schema.user, eq(schema.account.userId, discordUser.id))
		.where(
			and(eq(schema.account.provider, 'discord'), eq(schema.account.providerUserId, discordUser.id))
		)
		.get();

	console.log(accountInDb);

	if (accountInDb) {
		await db
			.update(schema.account)
			.set({
				accessToken: data.access_token,
				refreshToken: data.refresh_token,
				expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
				scope: data.scope
			})
			.where(
				and(
					eq(schema.account.provider, 'discord'),
					eq(schema.account.providerUserId, discordUser.id)
				)
			);
	} else {
		const newUserId = crypto.randomUUID();
		await db.insert(schema.user).values({
			id: newUserId,
			email: discordUser.email,
			username: discordUser.username,
			verified: true,
			passwordHash: 'oauth',
			createdAt: new Date(),
			updatedAt: new Date()
		});

		await db.insert(schema.account).values({
			provider: 'discord',
			providerUserId: discordUser.id,
			userId: newUserId,
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
			scope: data.scope
		});
	}

	// Weiterleitung zur App
	throw redirect(302, '/admin/');
};
