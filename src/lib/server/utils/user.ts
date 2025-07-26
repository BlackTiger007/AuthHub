import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { passkeyCredential, securityKeyCredential, totpCredential, user } from '../db/schema';
import { decryptToString, encryptString } from './encryption';
import { hashPassword } from './password';
import { generateRandomRecoveryCode } from './utils';
import type { User, UserAuth } from '../db/schema';
import { generateId } from './auth';

export function verifyUsernameInput(username: string): boolean {
	return username.length > 3 && username.length < 32 && username.trim() === username;
}

export async function createUser(email: string, username: string, password: string): Promise<User> {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);
	const userId = generateId();

	const inserted = await db
		.insert(user)
		.values({
			id: userId,
			email,
			username,
			passwordHash,
			recoveryCode: encryptedRecoveryCode,
			createdAt: new Date(),
			updatedAt: new Date()
		})
		.returning();

	const newUser = inserted[0];
	if (!newUser) throw new Error('Unexpected error while creating user');

	return newUser;
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db.update(user).set({ passwordHash }).where(eq(user.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(
	userId: string,
	email: string
): Promise<void> {
	await db.update(user).set({ email, emailVerified: true }).where(eq(user.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(
	userId: string,
	email: string
): Promise<boolean> {
	const result = await db
		.update(user)
		.set({ emailVerified: true })
		.where(and(eq(user.id, userId), eq(user.email, email)));

	return result.changes > 0;
}

export async function getUserPasswordHash(userId: string): Promise<string> {
	const row = await db.query.user.findFirst({
		columns: { passwordHash: true },
		where: eq(user.id, userId)
	});
	if (!row?.passwordHash) {
		throw new Error('Invalid user ID');
	}
	return row.passwordHash;
}

export async function getUserRecoverCode(userId: string): Promise<string> {
	const row = await db.query.user.findFirst({
		columns: { recoveryCode: true },
		where: eq(user.id, userId)
	});
	if (!row?.recoveryCode) {
		throw new Error('Invalid user ID');
	}
	return decryptToString(row.recoveryCode);
}

export async function resetUserRecoveryCode(userId: string): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = encryptString(recoveryCode);
	await db.update(user).set({ recoveryCode: encrypted }).where(eq(user.id, userId));
	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<UserAuth | null> {
	const result = await db
		.select({
			user: user,
			hasTOTP: totpCredential.id,
			hasPasskey: passkeyCredential.id,
			hasSecurityKey: securityKeyCredential.id
		})
		.from(user)
		.leftJoin(totpCredential, eq(totpCredential.userId, user.id))
		.leftJoin(passkeyCredential, eq(passkeyCredential.userId, user.id))
		.leftJoin(securityKeyCredential, eq(securityKeyCredential.userId, user.id))
		.where(eq(user.email, email));

	if (!result.length) return null;

	const row = result[0];

	const usr: UserAuth = {
		...row.user,
		registeredTOTP: !!row.hasTOTP,
		registeredPasskey: !!row.hasPasskey,
		registeredSecurityKey: !!row.hasSecurityKey,
		registered2FA: !!(row.hasTOTP || row.hasPasskey || row.hasSecurityKey)
	};

	return usr;
}
