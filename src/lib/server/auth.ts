import type { RequestEvent } from '@sveltejs/kit';
import { eq, getTableColumns } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 7),
		lastActiveAt: new Date()
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const { passwordHash: _passwordHash, ...userColumns } = getTableColumns(table.user);

	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: userColumns,
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}

	const { session, user } = result;

	const now = Date.now();
	const sessionExpires = session.expiresAt.getTime();
	const lastActive = session.lastActiveAt?.getTime() ?? 0;

	// Session abgelaufen → löschen
	if (now >= sessionExpires) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}

	// Bedingungen
	const renewThreshold = DAY_IN_MS * 3; // 3 Tage vor Ablauf erneuern

	// Letzte Aktivität älter als heute → aktualisieren
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const lastActiveDate = new Date(lastActive);
	lastActiveDate.setHours(0, 0, 0, 0);

	const shouldRenewSession = now >= sessionExpires - renewThreshold;
	const shouldUpdateLastActive = lastActiveDate.getTime() < today.getTime();

	if (shouldRenewSession || shouldUpdateLastActive) {
		const updates: Partial<typeof table.session.$inferInsert> = {};
		if (shouldRenewSession) updates.expiresAt = new Date(now + DAY_IN_MS * 7);
		if (shouldUpdateLastActive) updates.lastActiveAt = new Date();

		await db.update(table.session).set(updates).where(eq(table.session.id, session.id));

		// Synchronisiere Änderungen im Speicher-Objekt
		if (updates.expiresAt) session.expiresAt = updates.expiresAt;
		if (updates.lastActiveAt) session.lastActiveAt = updates.lastActiveAt;
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
