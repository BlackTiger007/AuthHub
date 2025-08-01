import { redirect } from '@sveltejs/kit';
import { get2FARedirect } from '$lib/server/utils/2fa';
import { getUserSecurityKeyCredentials } from '$lib/server/utils/webauthn';

import type { RequestEvent } from './$types';
import { publicUser } from '$lib/server/utils/publicCLientUser';

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/verify-email');
	}
	if (!event.locals.user.registered2FA) {
		return redirect(302, '/');
	}
	if (event.locals.session.twoFactorVerified) {
		return redirect(302, '/');
	}
	if (!event.locals.user.registeredSecurityKey) {
		return redirect(302, get2FARedirect(event.locals.user));
	}
	const credentials = await getUserSecurityKeyCredentials(event.locals.user.id);
	return {
		credentials,
		user: publicUser(event.locals.user)
	};
}
