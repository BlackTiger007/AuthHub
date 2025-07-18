import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const logs = await db.select().from(schema.log);
	return { logs };
}) satisfies PageServerLoad;
