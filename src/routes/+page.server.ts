import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Role } from '$lib/utils/roles';

export const load = (async ({ locals }) => {
	if (locals.user && locals.user.role > Role.Admin) {
		return redirect(302, '/admin');
	}

	return {};
}) satisfies PageServerLoad;
