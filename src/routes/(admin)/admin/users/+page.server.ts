import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const users = await db.select().from(schema.user);
	return { users };
}) satisfies PageServerLoad;
