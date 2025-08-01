import { fail, redirect } from '@sveltejs/kit';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/utils/session';
import { get2FARedirect } from '$lib/server/utils/2fa';

import type { Actions, PageServerLoadEvent, RequestEvent } from './$types';
import { publicUser } from '$lib/server/utils/publicCLientUser';

export function load(event: PageServerLoadEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/verify-email');
	}
	if (!event.locals.user.registered2FA) {
		return redirect(302, '/2fa/setup');
	}
	if (!event.locals.session.twoFactorVerified) {
		return redirect(302, get2FARedirect(event.locals.user));
	}
	return {
		user: publicUser(event.locals.user)
	};
}

export const actions: Actions = {
	logout: action
};

async function action(event: RequestEvent) {
	if (event.locals.session === null) {
		return fail(401, {
			message: 'Not authenticated'
		});
	}
	invalidateSession(event.locals.session.id);
	deleteSessionTokenCookie(event);
	return redirect(302, '/login');
}
