import { redirect } from '@sveltejs/kit';

import type { RequestEvent } from './$types';

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/verify-email');
	}
	if (
		event.locals.user.registeredTOTP &&
		event.locals.user.registeredPasskey &&
		event.locals.user.registeredSecurityKey
	) {
		return redirect(302, '/');
	}
	return {
		registered2FA: event.locals.user.registered2FA,
		registeredTOTP: event.locals.user.registeredTOTP,
		registeredPasskey: event.locals.user.registeredPasskey,
		registeredSecurityKey: event.locals.user.registeredSecurityKey
	};
}
