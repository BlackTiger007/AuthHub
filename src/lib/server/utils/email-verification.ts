import { generateRandomOTP } from './utils';
import { db } from '../db';
import { ExpiringTokenBucket } from './rate-limit';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import {
	emailVerificationRequest,
	type EmailVerificationRequest
} from '../db/schema/email-verification-request';
import { eq, and } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { sendMail } from './email';

export async function getUserEmailVerificationRequest(
	userId: string,
	id: string
): Promise<EmailVerificationRequest | null> {
	const result = await db
		.select()
		.from(emailVerificationRequest)
		.where(and(eq(emailVerificationRequest.id, id), eq(emailVerificationRequest.userId, userId)))
		.limit(1);

	if (result.length === 0) {
		return null;
	}

	const row = result[0];
	return {
		id: row.id,
		userId: row.userId,
		code: row.code,
		email: row.email,
		expiresAt: new Date(row.expiresAt.getTime() * 1000) // Könne zu einem fehler kommen da expiresAt ein string sein könnte
	};
}

export async function createEmailVerificationRequest(
	userId: string,
	email: string
): Promise<EmailVerificationRequest> {
	await deleteUserEmailVerificationRequest(userId);

	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32LowerCaseNoPadding(idBytes);

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

	await db.insert(emailVerificationRequest).values({
		id,
		userId,
		code,
		email,
		expiresAt: new Date(Math.floor(expiresAt.getTime() / 1000))
	});

	return {
		id,
		userId,
		code,
		email,
		expiresAt
	};
}

export async function deleteUserEmailVerificationRequest(userId: string): Promise<void> {
	await db.delete(emailVerificationRequest).where(eq(emailVerificationRequest.userId, userId));
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
	return await sendMail({
		to: email,
		subject: 'Email Verification',
		html: `<p>Your verification code is <strong>${code}</strong>.</p>`,
		text: `Your verification code is ${code}.`
	});
}

export function setEmailVerificationRequestCookie(
	event: RequestEvent,
	request: EmailVerificationRequest
): void {
	event.cookies.set('email_verification', request.id, {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: request.expiresAt
	});
}

export function deleteEmailVerificationRequestCookie(event: RequestEvent): void {
	event.cookies.set('email_verification', '', {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 0
	});
}

export async function getUserEmailVerificationRequestFromRequest(
	event: RequestEvent
): Promise<EmailVerificationRequest | null> {
	if (!event.locals.user) return null;

	const id = event.cookies.get('email_verification') ?? null;
	if (!id) return null;

	const request = await getUserEmailVerificationRequest(event.locals.user.id, id);
	if (request === null) {
		deleteEmailVerificationRequestCookie(event);
	}
	return request;
}

// Token Bucket für Rate Limiting
export const sendVerificationEmailBucket = new ExpiringTokenBucket<string>(3, 60 * 10);
