import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import { eq, getTableColumns } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const { passwordHash: _passwordHash, ...userColumns } = getTableColumns(schema.user);

	const user = db
		.select(userColumns)
		.from(schema.user)
		.where(eq(schema.user.id, params.userid))
		.get();

	if (!user) {
		error(404, 'User not found');
	}

	return { user };
}) satisfies PageServerLoad;

export const actions = {
	verify: async ({ locals }) => {
		// TODO send verification email

		return fail(400, { form: 'verify', message: 'TODO' });

		return { form: 'verify', success: true };
	},
	role: async ({ locals }) => {
		// TODO change Role

		return fail(400, { form: 'role', message: 'TODO' });

		return { form: 'verify', success: true };
	}
} satisfies Actions;
