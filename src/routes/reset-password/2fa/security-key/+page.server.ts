import { redirect } from '@sveltejs/kit';
import { getPasswordReset2FARedirect } from '$lib/server/utils/2fa';
import { getUserSecurityKeyCredentials } from '$lib/server/utils/webauthn';
import { validatePasswordResetSessionRequest } from '$lib/server/utils/password-reset';

import type { RequestEvent } from './$types';
import { publicUser } from '$lib/server/utils/publicCLientUser';
import { encodeBase64 } from '@oslojs/encoding';

export async function load(event: RequestEvent) {
	const { session, user } = await validatePasswordResetSessionRequest(event);

	if (session === null) {
		return redirect(302, '/forgot-password');
	}
	if (!session.emailVerified) {
		return redirect(302, '/reset-password/verify-email');
	}
	if (!user.registered2FA) {
		return redirect(302, '/reset-password');
	}
	if (session.twoFactorVerified) {
		return redirect(302, '/reset-password');
	}
	if (!user.registeredSecurityKey) {
		return redirect(302, getPasswordReset2FARedirect(user));
	}
	const credentialsRaw = await getUserSecurityKeyCredentials(user.id);

	const credentials = credentialsRaw.map((c) => ({
		...c,
		id: encodeBase64(c.id),
		publicKey: encodeBase64(c.publicKey)
	}));

	return {
		credentials,
		user: publicUser(user)
	};
}
