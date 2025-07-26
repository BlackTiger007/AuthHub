import { redirect } from '@sveltejs/kit';
import { get2FARedirect } from '$lib/server/utils/2fa';
import { getUserPasskeyCredentials } from '$lib/server/utils/webauthn';

import type { RequestEvent } from './$types';
import { publicUser } from '$lib/server/utils/publicCLientUser';
import { encodeBase64 } from '@oslojs/encoding';

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
	if (!event.locals.user.registeredPasskey) {
		return redirect(302, get2FARedirect(event.locals.user));
	}
	const credentialsRaw = await getUserPasskeyCredentials(event.locals.user.id);

	const credentials = credentialsRaw.map((c) => ({
		...c,
		id: encodeBase64(c.id),
		publicKey: encodeBase64(c.publicKey)
	}));

	return {
		credentials,
		user: publicUser(event.locals.user)
	};
}
