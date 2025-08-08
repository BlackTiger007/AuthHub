import { fail, redirect } from '@sveltejs/kit';
import { verifyEmailInput } from '$lib/server/utils/email';
import { getUserFromEmail, getUserPasswordHash } from '$lib/server/utils/user';
import { RefillingTokenBucket, Throttler } from '$lib/server/utils/rate-limit';
import { verifyPasswordHash } from '$lib/server/utils/password';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/utils/session';
import { get2FARedirect } from '$lib/server/utils/2fa';

import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { settings } from '$lib/server/store.svelte';
import { getOAuthParams } from '$lib/server/utils/oauth';

export const load: PageServerLoad = async (event) => {
	if (event.locals.session !== null && event.locals.user !== null) {
		if (!event.locals.user.emailVerified) {
			return redirect(302, '/verify-email');
		}
		if (!event.locals.user.registered2FA) {
			return redirect(302, '/2fa/setup');
		}
		if (!event.locals.session.twoFactorVerified) {
			return redirect(302, get2FARedirect(event.locals.user));
		}
		return redirect(302, '/');
	}

	const discord =
		settings.Discord.clientID &&
		settings.Discord.clientSecret &&
		settings.Discord.scopes.length > 0;
	const github =
		settings.GitHub.clientID && settings.GitHub.clientSecret && settings.GitHub.scopes.length > 0;

	const oauthError =
		event.url.searchParams.get('oauth_error') === 'email_not_linked'
			? 'Your email is not linked to this OAuth provider. Please link your email first.'
			: '';

	return { discord, github, oauthError };
};

const throttler = new Throttler<string>([0, 1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	// TODO: Assumes X-Forwarded-For is always included.
	const clientIP = event.request.headers.get('X-Forwarded-For');
	if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}

	const formData = await event.request.formData();
	const email = formData.get('email');
	const password = formData.get('password');
	if (typeof email !== 'string' || typeof password !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields',
			email: ''
		});
	}
	if (email === '' || password === '') {
		return fail(400, {
			message: 'Please enter your email and password.',
			email
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			message: 'Invalid email',
			email
		});
	}
	const user = await getUserFromEmail(email);
	if (user === null) {
		return fail(400, {
			message: 'Account does not exist',
			email
		});
	}
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}
	if (!throttler.consume(user.id)) {
		return fail(429, {
			message: 'Too many requests',
			email: ''
		});
	}
	const passwordHash = await getUserPasswordHash(user.id);
	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		return fail(400, {
			message: 'Invalid password',
			email
		});
	}
	throttler.reset(user.id);
	const sessionToken = generateSessionToken();
	const { redirect_uri, state } = getOAuthParams(event);
	const session = await createSession(sessionToken, user.id, false, redirect_uri, state);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	if (!user.emailVerified) {
		return redirect(302, '/verify-email');
	}
	if (!user.registered2FA) {
		return redirect(302, '/2fa/setup');
	}
	return redirect(302, get2FARedirect(user));
}
