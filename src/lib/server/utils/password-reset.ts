import { db } from '../db';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { generateRandomOTP } from './utils';
import { sha256 } from '@oslojs/crypto/sha2';

import {
	passwordResetSession,
	user,
	totpCredential,
	passkeyCredential,
	securityKeyCredential
} from '../db/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import type { PasswordResetSession, UserAuth } from '../db/schema';

export async function createPasswordResetSession(
	token: string,
	userId: string,
	email: string
): Promise<PasswordResetSession> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: PasswordResetSession = {
		id: sessionId,
		userId,
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 10),
		code: generateRandomOTP(),
		emailVerified: false,
		twoFactorVerified: false
	};

	await db.insert(passwordResetSession).values(session);

	return session;
}

export async function validatePasswordResetSessionToken(
	token: string
): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const result = await db
		.select({
			session: passwordResetSession,
			user: user,
			hasTOTP: totpCredential.id,
			hasPasskey: passkeyCredential.id,
			hasSecurityKey: securityKeyCredential.id
		})
		.from(passwordResetSession)
		.innerJoin(user, eq(passwordResetSession.userId, user.id))
		.leftJoin(totpCredential, eq(totpCredential.userId, user.id))
		.leftJoin(passkeyCredential, eq(passkeyCredential.userId, user.id))
		.leftJoin(securityKeyCredential, eq(securityKeyCredential.userId, user.id))
		.where(eq(passwordResetSession.id, sessionId))
		.limit(1);

	if (result.length === 0) {
		return { session: null, user: null };
	}

	const row = result[0];

	const session: PasswordResetSession = row.session;

	const userResult: UserAuth = {
		...row.user,
		registeredTOTP: !!row.hasTOTP,
		registeredPasskey: !!row.hasPasskey,
		registeredSecurityKey: !!row.hasSecurityKey,
		registered2FA: false
	};

	if (
		userResult.registeredTOTP ||
		userResult.registeredPasskey ||
		userResult.registeredSecurityKey
	) {
		userResult.registered2FA = true;
	}

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(passwordResetSession).where(eq(passwordResetSession.id, session.id));
		return { session: null, user: null };
	}

	return { session, user: userResult };
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetSession)
		.set({ emailVerified: true })
		.where(eq(passwordResetSession.id, sessionId));
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetSession)
		.set({ twoFactorVerified: true })
		.where(eq(passwordResetSession.id, sessionId));
}

export async function invalidateUserPasswordResetSessions(userId: string): Promise<void> {
	await db.delete(passwordResetSession).where(eq(passwordResetSession.userId, userId));
}

export async function validatePasswordResetSessionRequest(
	event: RequestEvent
): Promise<PasswordResetSessionValidationResult> {
	const token = event.cookies.get('password_reset_session') ?? null;
	if (!token) return { session: null, user: null };

	const result = await validatePasswordResetSessionToken(token);
	if (result.session === null) {
		deletePasswordResetSessionTokenCookie(event);
	}
	return result;
}

export function setPasswordResetSessionTokenCookie(
	event: RequestEvent,
	token: string,
	expiresAt: Date
): void {
	event.cookies.set('password_reset_session', token, {
		expires: expiresAt,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !import.meta.env.DEV
	});
}

export function deletePasswordResetSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('password_reset_session', '', {
		maxAge: 0,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !import.meta.env.DEV
	});
}

export function sendPasswordResetEmail(email: string, code: string): void {
	console.log(`To ${email}: Your reset code is ${code}`);
}

export type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: UserAuth }
	| { session: null; user: null };
