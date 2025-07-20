import { discord } from '$lib/server/db/oauth';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

import { ArcticFetchError, OAuth2RequestError, type OAuth2Tokens } from 'arctic';
import type { RequestEvent } from './$types';
import { schema } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { generateId } from '$lib/server/utils/auth';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get('discord_oauth_state') ?? null;
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	if (storedState === null || code === null || state === null) {
		return new Response('Please restart the process.', {
			status: 400
		});
	}
	if (storedState !== state) {
		return new Response('Please restart the process.', {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await discord(event.url.origin).validateAuthorizationCode(code, null);
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			console.log('Invalid authorization code, credentials, or redirect URI');
		}
		if (e instanceof ArcticFetchError) {
			console.log('Failed to call `fetch()`');
		}
		console.error(e);
		return new Response('Please restart the process.', {
			status: 400
		});
	}

	const discordAccessToken = tokens.accessToken();

	const userRequest = new Request('https://discord.com/api/users/@me');
	userRequest.headers.set('Authorization', `Bearer ${discordAccessToken}`);
	const userResponse = await fetch(userRequest);
	const userResult: discordUser = await userResponse.json();
	const userParser = new ObjectParser(userResult);

	const discordUserId = userParser.getString('id');
	const username = userParser.getString('username');

	const existingUser = getUserFromDiscordId(discordUserId);
	if (existingUser !== null) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		});
	}

	const email = userParser.getString('email');

	if (!userParser.getBoolean('verified')) {
		return new Response('Please verify your Discord email address.', {
			status: 400
		});
	}

	let userId: string;
	try {
		userId = await createUser(discordUserId, email, username);
	} catch (err) {
		if (err instanceof Response && err.status === 400) {
			// Versuch: Gibt es einen User mit dieser E-Mail?
			const existing = await getUserByEmail(email);

			if (!existing) {
				return err;
			}

			// Verknüpfe den bestehenden Account mit Discord
			await db
				.update(schema.user)
				.set({
					discordId: discordUserId,
					updatedAt: new Date(),
					lastLogin: new Date()
				})
				.where(eq(schema.user.id, existing.id));

			userId = existing.id;
		} else {
			throw err;
		}
	}

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, userId);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/'
		}
	});
}

async function createUser(discordId: string, email: string, username: string) {
	const userId = generateId();

	try {
		await db.insert(schema.user).values({
			id: userId,
			username,
			email,
			discordId: discordId,
			createdAt: new Date(),
			updatedAt: new Date(),
			lastLogin: new Date()
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
			throw new Response('Username or email already exists.', { status: 400 });
		}
		console.log('new user error: ', error);

		throw error;
	}
	return userId;
}

function getUserFromDiscordId(discordId: string) {
	const user = db.select().from(schema.user).where(eq(schema.user.discordId, discordId)).get();

	if (!user || user === null) {
		return null;
	}

	return user;
}

async function getUserByEmail(email: string) {
	const user = db.select().from(schema.user).where(eq(schema.user.email, email)).get();

	return user ?? null;
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
