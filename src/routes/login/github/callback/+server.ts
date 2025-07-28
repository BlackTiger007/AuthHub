import { github } from '$lib/server/utils/oauth';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

import type { OAuth2Tokens } from 'arctic';
import type { RequestEvent } from './$types';
import { schema } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent): Promise<Response> {
	const storedState = event.cookies.get('github_oauth_state') ?? null;
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
		tokens = await github(event.url.origin).validateAuthorizationCode(code);
	} catch {
		return new Response('Please restart the process.', { status: 400 });
	}

	const githubAccessToken = tokens.accessToken();

	const userRequest = new Request('https://api.github.com/user');
	userRequest.headers.set('Authorization', `Bearer ${githubAccessToken}`);
	const userResponse = await fetch(userRequest);
	const userResult: githubUser = await userResponse.json();
	const userParser = new ObjectParser(userResult);

	const githubUserId = userParser.getNumber('id');

	// Prüfe, ob User mit GitHub ID existiert
	const userByGitHubId = getUserFromGitHubId(githubUserId);
	if (userByGitHubId !== null) {
		// User mit GitHub-ID gefunden → Login
		return createLoginSession(event, userByGitHubId.id);
	}

	// GitHub-ID nicht gefunden → Prüfe ob E-Mail schon im System vorhanden ist
	const emailListRequest = new Request('https://api.github.com/user/emails');
	emailListRequest.headers.set('Authorization', `Bearer ${githubAccessToken}`);
	const emailListResponse = await fetch(emailListRequest);
	const emailListResult: unknown = await emailListResponse.json();

	if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
		return new Response('Please restart the process.', { status: 400 });
	}

	let email: string | null = null;
	for (const emailRecord of emailListResult) {
		const emailParser = new ObjectParser(emailRecord);
		const primaryEmail = emailParser.getBoolean('primary');
		const verifiedEmail = emailParser.getBoolean('verified');
		if (primaryEmail && verifiedEmail) {
			email = emailParser.getString('email');
			break;
		}
	}

	if (email === null) {
		return new Response('Please verify your GitHub email address.', { status: 400 });
	}

	const existingUserByEmail = await getUserByEmail(email);
	if (existingUserByEmail !== null) {
		// E-Mail existiert, aber GitHub nicht verknüpft → Login-Seite (mit Info evtl.)
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login'
			}
		});
	}

	// Weder GitHub-ID noch E-Mail existieren → Registrierung
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/register'
		}
	});
}

function getUserFromGitHubId(githubId: number) {
	const user = db.select().from(schema.user).where(eq(schema.user.githubId, githubId)).get();
	return user ?? null;
}

async function getUserByEmail(email: string) {
	const user = db.select().from(schema.user).where(eq(schema.user.email, email)).get();
	return user ?? null;
}

async function createLoginSession(event: RequestEvent, userId: string) {
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
