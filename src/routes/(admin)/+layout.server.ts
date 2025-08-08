import { Role } from '$lib/utils/roles';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { settings } from '$lib/server/store.svelte';

export const load = (async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/login');
	}

	if (locals.user.role < Role.Admin) {
		error(403, 'Forbidden');
	}

	return {
		smtp: settings.SMTP.host === '' || settings.SMTP.port === 0 || settings.SMTP.from === ''
	};
}) satisfies LayoutServerLoad;
