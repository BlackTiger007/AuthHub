import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	sendVerificationEmailBucket,
	setEmailVerificationRequestCookie
} from '$lib/server/utils/email-verification';
import { error, fail, redirect } from '@sveltejs/kit';
import { checkEmailAvailability, sendMail, verifyEmailInput } from '$lib/server/utils/email';
import { verifyPasswordHash, verifyPasswordStrength } from '$lib/server/utils/password';
import {
	getUserPasswordHash,
	resetUserRecoveryCode,
	updateUserPassword
} from '$lib/server/utils/user';
import {
	createSession,
	generateSessionToken,
	invalidateUserSessions,
	setSessionTokenCookie
} from '$lib/server/utils/session';
import {
	deleteUserPasskeyCredential,
	deleteUserSecurityKeyCredential,
	getUserPasskeyCredentials,
	getUserSecurityKeyCredentials
} from '$lib/server/utils/webauthn';
import { decodeBase64, encodeBase64 } from '@oslojs/encoding';
import { deleteUserTOTPKey, totpUpdateBucket } from '$lib/server/utils/totp';

import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = (async ({ params }) => {
	const [result] = await db
		.select({
			user: schema.user,
			hasTOTP: schema.totpCredential.id,
			hasPasskey: schema.passkeyCredential.id,
			hasSecurityKey: schema.securityKeyCredential.id
		})
		.from(schema.user)
		.leftJoin(schema.totpCredential, eq(schema.totpCredential.userId, params.userid))
		.leftJoin(schema.passkeyCredential, eq(schema.passkeyCredential.userId, params.userid))
		.leftJoin(schema.securityKeyCredential, eq(schema.securityKeyCredential.userId, params.userid))
		.where(eq(schema.user.id, params.userid));

	if (!result.user) {
		return error(404, 'User not found');
	}

	const {
		discordId,
		githubId,
		recoveryCode: _recoveryCode,
		passwordHash: _passwordHash,
		...row
	} = result.user;

	const usr = {
		...row,
		discord: !!discordId,
		github: !!githubId,
		registeredTOTP: !!result.hasTOTP,
		registeredPasskey: !!result.hasPasskey,
		registeredSecurityKey: !!result.hasSecurityKey,
		registered2FA: !!(result.hasTOTP || result.hasPasskey || result.hasSecurityKey)
	};

	const passkeyCredentialsRaw = await getUserPasskeyCredentials(params.userid);
	const securityKeyCredentialsRaw = await getUserSecurityKeyCredentials(params.userid);

	const passkeyCredentials = passkeyCredentialsRaw.map((c) => ({
		...c,
		id: encodeBase64(c.id),
		publicKey: encodeBase64(c.publicKey)
	}));

	const securityKeyCredentials = securityKeyCredentialsRaw.map((c) => ({
		...c,
		id: encodeBase64(c.id),
		publicKey: encodeBase64(c.publicKey)
	}));

	return {
		user: usr,
		passkeyCredentials,
		securityKeyCredentials
	};
}) satisfies PageServerLoad;

export const actions = {
	update_password: updatePasswordAction,
	update_email: updateEmailAction,
	disconnect_totp: disconnectTOTPAction,
	delete_passkey: deletePasskeyAction,
	delete_security_key: deleteSecurityKeyAction,
	regenerate_recovery_code: regenerateRecoveryCodeAction,
	delete_oauth: deleteOauth
} satisfies Actions;

async function updatePasswordAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			password: {
				message: 'Not authenticated'
			}
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			password: {
				message: 'Forbidden'
			}
		});
	}

	const formData = await event.request.formData();
	const password = formData.get('password');
	const newPassword = formData.get('new_password');
	if (typeof password !== 'string' || typeof newPassword !== 'string') {
		return fail(400, {
			password: {
				message: 'Invalid or missing fields'
			}
		});
	}
	const strongPassword = await verifyPasswordStrength(newPassword);
	if (!strongPassword) {
		return fail(400, {
			password: {
				message: 'Weak password'
			}
		});
	}

	const passwordHash = await getUserPasswordHash(event.locals.user.id);
	const validPassword = await verifyPasswordHash(passwordHash, password);
	if (!validPassword) {
		return fail(400, {
			password: {
				message: 'Incorrect password'
			}
		});
	}
	invalidateUserSessions(event.locals.user.id);
	await updateUserPassword(event.locals.user.id, newPassword);

	const sessionToken = generateSessionToken();
	const session = await createSession(
		sessionToken,
		event.locals.user.id,
		event.locals.session.twoFactorVerified
	);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);
	return {
		password: {
			message: 'Updated password'
		}
	};
}

async function updateEmailAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			email: {
				message: 'Not authenticated'
			}
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			email: {
				message: 'Forbidden'
			}
		});
	}
	if (!sendVerificationEmailBucket.check(event.locals.user.id, 1)) {
		return fail(429, {
			email: {
				message: 'Too many requests'
			}
		});
	}

	const formData = await event.request.formData();
	const email = formData.get('email');
	if (typeof email !== 'string') {
		return fail(400, {
			email: {
				message: 'Invalid or missing fields'
			}
		});
	}
	if (email === '') {
		return fail(400, {
			email: {
				message: 'Please enter your email'
			}
		});
	}
	if (!verifyEmailInput(email)) {
		return fail(400, {
			email: {
				message: 'Please enter a valid email'
			}
		});
	}
	const emailAvailable = await checkEmailAvailability(email);
	if (!emailAvailable) {
		return fail(400, {
			email: {
				message: 'This email is already used'
			}
		});
	}
	if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
		return fail(429, {
			email: {
				message: 'Too many requests'
			}
		});
	}
	const verificationRequest = await createEmailVerificationRequest(event.locals.user.id, email);

	try {
		await sendVerificationEmail(verificationRequest.email, verificationRequest.code);
	} catch (error) {
		return fail(400, {
			message: 'Failed to send verification email: ' + error
		});
	}

	setEmailVerificationRequestCookie(event, verificationRequest);
	return redirect(302, '/verify-email');
}

async function disconnectTOTPAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (!event.locals.user.emailVerified) {
		return fail(403);
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403);
	}
	if (!totpUpdateBucket.consume(event.locals.user.id, 1)) {
		return fail(429);
	}
	deleteUserTOTPKey(event.locals.user.id);
	return {};
}

async function deletePasskeyAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (!event.locals.user.emailVerified) {
		return fail(403);
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403);
	}
	const formData = await event.request.formData();
	const encodedCredentialId = formData.get('credential_id');
	if (typeof encodedCredentialId !== 'string') {
		return fail(400);
	}
	let credentialId: Uint8Array;
	try {
		credentialId = decodeBase64(encodedCredentialId);
	} catch {
		return fail(400);
	}
	const deleted = await deleteUserPasskeyCredential(event.locals.user.id, credentialId);
	if (!deleted) {
		return fail(400);
	}
	return {};
}

async function deleteSecurityKeyAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (!event.locals.user.emailVerified) {
		return fail(403);
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403);
	}
	const formData = await event.request.formData();
	const encodedCredentialId = formData.get('credential_id');
	if (typeof encodedCredentialId !== 'string') {
		return fail(400);
	}
	let credentialId: Uint8Array;
	try {
		credentialId = decodeBase64(encodedCredentialId);
	} catch {
		return fail(400);
	}
	const deleted = await deleteUserSecurityKeyCredential(event.locals.user.id, credentialId);
	if (!deleted) {
		return fail(400);
	}
	return {};
}

async function regenerateRecoveryCodeAction(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401);
	}
	if (!event.locals.user.emailVerified) {
		return fail(403);
	}
	if (!event.locals.session.twoFactorVerified) {
		return fail(403);
	}

	const code = await resetUserRecoveryCode(event.locals.session.userId);

	// TODO: Update HTML to show the new recovery code
	await sendMail({
		to: event.locals.user.email,
		subject: 'New Recovery Code',
		html: `<p>Your new recovery code is <strong>${code}</strong>.</p>`,
		text: `Your new recovery code is ${code}.`
	});
	return {
		form: 'regenerate_recovery_code',
		success: true,
		message: 'Recovery code regenerated and sent to the registered email.'
	};
}

async function deleteOauth(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			auth: {
				message: 'Not authenticated'
			}
		});
	}
	if (
		(event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) ||
		event.locals.user.id === event.params.userid
	) {
		return fail(403, {
			auth: {
				message: 'Forbidden'
			}
		});
	}

	const authTypes = ['githubId', 'discordId'] as const;

	const formData = await event.request.formData();
	const authName = formData.get('auth_name');
	if (typeof authName !== 'string' || !authTypes.includes(authName as (typeof authTypes)[number])) {
		return fail(400, {
			auth: {
				message: 'Invalid or missing fields'
			}
		});
	}

	await db
		.update(schema.user)
		.set({ [authName]: null })
		.where(eq(schema.user.id, event.params.userid));

	return {
		auth: {
			message: 'Deleted'
		}
	};
}
