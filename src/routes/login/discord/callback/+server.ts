import { discord } from '$lib/server/utils/oauth';
import { ObjectParser } from '@pilcrowjs/object-parser';

import { type OAuth2Tokens } from 'arctic';
import type { RequestEvent } from './$types';
import { schema } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/utils/session';

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get('discord_oauth_state') ?? null;
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	if (storedState === null || code === null || state === null) {
		return new Response('Please restart the process.', { status: 400 });
	}
	if (storedState !== state) {
		return new Response('Please restart the process.', { status: 400 });
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await discord(event.url.origin).validateAuthorizationCode(code, null);
	} catch {
		return new Response('Please restart the process.', { status: 400 });
	}

	const discordAccessToken = tokens.accessToken();

	const userRequest = new Request('https://discord.com/api/users/@me');
	userRequest.headers.set('Authorization', `Bearer ${discordAccessToken}`);
	const userResponse = await fetch(userRequest);
	const userResult: discordUser = await userResponse.json();
	const userParser = new ObjectParser(userResult);

	const discordUserId = userParser.getString('id');

	const existingUserByDiscordId = getUserFromDiscordId(discordUserId);
	if (existingUserByDiscordId !== null) {
		return createLoginSession(event, existingUserByDiscordId.id);
	}

	// Prüfe, ob E-Mail verifiziert und vorhanden ist
	const email = userParser.getString('email');
	if (!userParser.getBoolean('verified') || !email) {
		return new Response('Please verify your Discord email address.', { status: 400 });
	}

	const existingUserByEmail = getUserByEmail(email);

	if (existingUserByEmail !== null) {
		const loggedInUser = event.locals.user;

		if (
			loggedInUser &&
			loggedInUser.id === existingUserByEmail.id &&
			loggedInUser.email === email
		) {
			// Benutzer ist eingeloggt und E-Mail passt → verknüpfe Discord-ID
			await db
				.update(schema.user)
				.set({ discordId: discordUserId })
				.where(eq(schema.user.id, loggedInUser.id));

			return new Response(null, {
				status: 302,
				headers: {
					Location: '/'
				}
			});
		}

		// Benutzer mit E-Mail existiert, aber nicht eingeloggt → Weiterleitung zum Login
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login?oauth_error=email_not_linked'
			}
		});
	}

	// Weder Discord-ID noch E-Mail existieren → Registrierung
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/register'
		}
	});
}

function getUserFromDiscordId(discordId: string) {
	const user = db.select().from(schema.user).where(eq(schema.user.discordId, discordId)).get();
	return user ?? null;
}

function getUserByEmail(email: string) {
	const user = db.select().from(schema.user).where(eq(schema.user.email, email)).get();
	return user ?? null;
}

async function createLoginSession(event: RequestEvent, userId: string) {
	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, userId, false);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}

type discordUser = {
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
