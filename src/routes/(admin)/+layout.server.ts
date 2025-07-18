import { requireLogin } from '$lib/server/utils/auth';
import { Role } from '$lib/utils/roles';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async () => {
	const user = requireLogin();
	if (user.role < Role.Admin) {
		error(403, 'Forbidden');
	}
	return {};
}) satisfies LayoutServerLoad;
