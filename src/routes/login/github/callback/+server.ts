import { github } from '$lib/server/db/oauth';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

import type { OAuth2Tokens } from 'arctic';
import type { RequestEvent } from './$types';
import { schema } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { generateId } from '$lib/server/utils/auth';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get('github_oauth_state') ?? null;
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
		tokens = await github(event.url.origin).validateAuthorizationCode(code);
	} catch {
		return new Response('Please restart the process.', {
			status: 400
		});
	}

	const githubAccessToken = tokens.accessToken();

	const userRequest = new Request('https://api.github.com/user');
	userRequest.headers.set('Authorization', `Bearer ${githubAccessToken}`);
	const userResponse = await fetch(userRequest);
	const userResult: githubUser = await userResponse.json();
	const userParser = new ObjectParser(userResult);

	const githubUserId = userParser.getNumber('id');
	const username = userParser.getString('login');

	const existingUser = getUserFromGitHubId(githubUserId);
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

	const emailListRequest = new Request('https://api.github.com/user/emails');
	emailListRequest.headers.set('Authorization', `Bearer ${githubAccessToken}`);
	const emailListResponse = await fetch(emailListRequest);
	const emailListResult: unknown = await emailListResponse.json();
	if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
		return new Response('Please restart the process.', {
			status: 400
		});
	}
	let email: string | null = null;
	for (const emailRecord of emailListResult) {
		const emailParser = new ObjectParser(emailRecord);
		const primaryEmail = emailParser.getBoolean('primary');
		const verifiedEmail = emailParser.getBoolean('verified');
		if (primaryEmail && verifiedEmail) {
			email = emailParser.getString('email');
		}
	}
	if (email === null) {
		return new Response('Please verify your GitHub email address.', {
			status: 400
		});
	}

	let userId: string;
	try {
		userId = await createUser(githubUserId, email, username);
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
					githubId: githubUserId,
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

async function createUser(githubId: number, email: string, username: string) {
	const userId = generateId();

	const user = {
		id: userId,
		username,
		email,
		githubId,
		createdAt: new Date(),
		updatedAt: new Date(),
		lastLogin: new Date()
	};

	try {
		await db.insert(schema.user).values(user);
	} catch (error) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
			throw new Response('Username or email already exists.', { status: 400 });
		}
		throw error;
	}
	return userId;
}

function getUserFromGitHubId(githubId: number) {
	const user = db.select().from(schema.user).where(eq(schema.user.githubId, githubId)).get();

	if (!user || user === null) {
		return null;
	}

	return user;
}

async function getUserByEmail(email: string) {
	const user = db.select().from(schema.user).where(eq(schema.user.email, email)).get();

	return user ?? null;
}

type githubUser = {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	user_view_type: string;
	site_admin: boolean;
	name: string;
	company: null;
	blog: string;
	location: null;
	email: null;
	hireable: null;
	bio: null;
	twitter_username: null;
	notification_email: null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: Date;
	updated_at: Date;
};
