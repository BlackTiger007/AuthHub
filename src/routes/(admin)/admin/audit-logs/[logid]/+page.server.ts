import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';

export const load = (async ({ params }) => {
	const log = db.select().from(schema.log).where(eq(schema.log.id, params.logid)).get();

	if (!log) {
		error(404, 'Log not found');
	}

	const user = log.userId
		? db.select().from(schema.user).where(eq(schema.user.id, log.userId)).get()
		: null;

	return { log, user };
}) satisfies PageServerLoad;
