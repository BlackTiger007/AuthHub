import { verifyEmailInput } from '$lib/server/utils/email';
import { getUserFromEmail } from '$lib/server/utils/user';
import {
	createPasswordResetSession,
	invalidateUserPasswordResetSessions,
	sendPasswordResetEmail,
	setPasswordResetSessionTokenCookie
} from '$lib/server/utils/password-reset';
import { RefillingTokenBucket } from '$lib/server/utils/rate-limit';
import { generateSessionToken } from '$lib/server/utils/session';
import { fail, redirect } from '@sveltejs/kit';

import type { Actions, RequestEvent } from './$types';

const ipBucket = new RefillingTokenBucket<string>(3, 60);
const userBucket = new RefillingTokenBucket<string>(3, 60);

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

	let email: FormDataEntryValue | null = null;
	try {
		const formData = await event.request.formData();
		email = formData.get('email');
	} catch {
		return fail(400, {
			message: 'Failed to read form data',
			email: ''
		});
	}

	if (typeof email !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields',
			email: ''
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
		return fail(400, {
			message: 'Too many requests',
			email
		});
	}

	if (!userBucket.consume(user.id, 1)) {
		return fail(400, {
			message: 'Too many requests',
			email
		});
	}

	await invalidateUserPasswordResetSessions(user.id);
	const sessionToken = generateSessionToken();
	const session = await createPasswordResetSession(sessionToken, user.id, user.email);

	try {
		await sendPasswordResetEmail(session.email, session.code);
	} catch (error) {
		return fail(400, {
			message: 'Failed to send password reset email: ' + error,
			email
		});
	}

	setPasswordResetSessionTokenCookie(event, sessionToken, session.expiresAt);
	return redirect(302, '/reset-password/verify-email');
}
