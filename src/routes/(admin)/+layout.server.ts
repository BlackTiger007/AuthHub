import { Role } from '$lib/utils/roles';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, '/login');
	}

	if (locals.user.role < Role.Admin) {
		error(403, 'Forbidden');
	}
	return {};
}) satisfies LayoutServerLoad;
