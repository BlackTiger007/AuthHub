import { db } from '../db';
import { eq } from 'drizzle-orm';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

import {
	session,
	user,
	totpCredential,
	passkeyCredential,
	securityKeyCredential
} from '../db/schema';
import type { RequestEvent } from '@sveltejs/kit';
import type { Session, UserAuth } from '../db/schema';

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const result = await db
		.select({
			session: session,
			user: user,
			hasTOTP: totpCredential.id,
			hasPasskey: passkeyCredential.id,
			hasSecurityKey: securityKeyCredential.id
		})
		.from(session)
		.innerJoin(user, eq(session.userId, user.id))
		.leftJoin(totpCredential, eq(totpCredential.userId, user.id))
		.leftJoin(passkeyCredential, eq(passkeyCredential.userId, user.id))
		.leftJoin(securityKeyCredential, eq(securityKeyCredential.userId, user.id))
		.where(eq(session.id, sessionId));

	if (!result.length) {
		return { session: null, user: null };
	}

	const row = result[0];

	const sess: Session = {
		id: row.session.id,
		userId: row.session.userId,
		expiresAt: new Date(row.session.expiresAt.getTime() * 1000),
		lastActiveAt: new Date(),
		twoFactorVerified: Boolean(row.session.twoFactorVerified)
	};

	const usr: UserAuth = {
		...row.user,
		registeredTOTP: !!row.hasTOTP,
		registeredPasskey: !!row.hasPasskey,
		registeredSecurityKey: !!row.hasSecurityKey,
		registered2FA: !!(row.hasTOTP || row.hasPasskey || row.hasSecurityKey)
	};

	if (Date.now() >= sess.expiresAt.getTime()) {
		await db.delete(session).where(eq(session.id, sessionId));
		return { session: null, user: null };
	}

	if (Date.now() >= sess.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		sess.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(session)
			.set({ expiresAt: new Date(Math.floor(sess.expiresAt.getTime() / 1000)) })
			.where(eq(session.id, sessionId));
	}

	return { session: sess, user: usr };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(session).where(eq(session.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
	await db.delete(session).where(eq(session.userId, userId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set('session', token, {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('session', '', {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 0
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	return encodeBase32LowerCaseNoPadding(tokenBytes);
}

export async function createSession(
	token: string,
	userId: string,
	twoFactorVerified: boolean
): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

	await db.insert(session).values({
		id: sessionId,
		userId,
		expiresAt: new Date(Math.floor(expiresAt.getTime() / 1000)),
		lastActiveAt: new Date(),
		twoFactorVerified
	});

	return {
		id: sessionId,
		userId,
		expiresAt,
		lastActiveAt: new Date(),
		twoFactorVerified: twoFactorVerified ?? false
	};
}

export async function setSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db.update(session).set({ twoFactorVerified: true }).where(eq(session.id, sessionId));
}

type SessionValidationResult = { session: Session; user: UserAuth } | { session: null; user: null };
