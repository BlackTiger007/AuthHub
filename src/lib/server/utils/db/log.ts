import { db } from '$lib/server/db';
import { log } from '$lib/server/db/schema/log';
import type { RequestEvent } from '@sveltejs/kit';
import type { LogEvent } from '$lib/utils/events';
import { generateId } from '../generateId';

export async function writeLog(event: RequestEvent, logEvent: LogEvent, data?: unknown) {
	await db.insert(log).values({
		id: generateId(),
		event: logEvent,
		userId: event.locals.user?.id,
		ip: event.getClientAddress(),
		userAgent: event.request.headers.get('user-agent') ?? '',
		referer: event.request.headers.get('referer') ?? '',
		data: data ? JSON.stringify(data) : null,
		createdAt: new Date()
	});
}
