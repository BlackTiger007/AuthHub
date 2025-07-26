import { encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '../db';
import { passkeyCredential, securityKeyCredential } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const challengeBucket = new Set<string>();

export function createWebAuthnChallenge(): Uint8Array {
	const challenge = new Uint8Array(20);
	crypto.getRandomValues(challenge);
	const encoded = encodeHexLowerCase(challenge);
	challengeBucket.add(encoded);
	return challenge;
}

export function verifyWebAuthnChallenge(challenge: Uint8Array): boolean {
	const encoded = encodeHexLowerCase(challenge);
	return challengeBucket.delete(encoded);
}

export async function getUserPasskeyCredentials(userId: string): Promise<WebAuthnUserCredential[]> {
	const rows = await db
		.select()
		.from(passkeyCredential)
		.where(eq(passkeyCredential.userId, userId));

	return rows.map((row) => ({
		id: row.id,
		userId: row.userId,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.publicKey
	}));
}

export function getPasskeyCredential(credentialId: Uint8Array): WebAuthnUserCredential | null {
	const row = db
		.select()
		.from(passkeyCredential)
		.where(eq(passkeyCredential.id, credentialId))
		.limit(1)
		.get();

	if (!row) return null;

	return {
		id: row.id,
		userId: row.userId,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.publicKey
	};
}

export async function getUserPasskeyCredential(
	userId: string,
	credentialId: Uint8Array
): Promise<WebAuthnUserCredential | null> {
	const row = db
		.select()
		.from(passkeyCredential)
		.where(and(eq(passkeyCredential.id, credentialId), eq(passkeyCredential.userId, userId)))
		.limit(1)
		.get();

	if (!row) return null;

	return {
		id: row.id,
		userId: row.userId,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.publicKey
	};
}

export async function createPasskeyCredential(credential: WebAuthnUserCredential): Promise<void> {
	await db.insert(passkeyCredential).values({
		id: credential.id,
		userId: credential.userId,
		name: credential.name,
		algorithm: credential.algorithmId,
		publicKey: credential.publicKey
	});
}

export async function deleteUserPasskeyCredential(
	userId: string,
	credentialId: Uint8Array
): Promise<boolean> {
	const result = await db
		.delete(passkeyCredential)
		.where(and(eq(passkeyCredential.id, credentialId), eq(passkeyCredential.userId, userId)));

	return result.changes > 0;
}

export async function getUserSecurityKeyCredentials(
	userId: string
): Promise<WebAuthnUserCredential[]> {
	const rows = await db
		.select()
		.from(securityKeyCredential)
		.where(eq(securityKeyCredential.userId, userId));

	return rows.map((row) => ({
		id: row.id,
		userId: row.userId,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.publicKey
	}));
}

export async function getUserSecurityKeyCredential(
	userId: string,
	credentialId: Uint8Array
): Promise<WebAuthnUserCredential | null> {
	const row = db
		.select()
		.from(securityKeyCredential)
		.where(
			and(eq(securityKeyCredential.id, credentialId), eq(securityKeyCredential.userId, userId))
		)
		.limit(1)
		.get();

	if (!row) return null;

	return {
		id: row.id,
		userId: row.userId,
		name: row.name,
		algorithmId: row.algorithm,
		publicKey: row.publicKey
	};
}

export async function createSecurityKeyCredential(
	credential: WebAuthnUserCredential
): Promise<void> {
	await db.insert(securityKeyCredential).values({
		id: credential.id,
		userId: credential.userId,
		name: credential.name,
		algorithm: credential.algorithmId,
		publicKey: credential.publicKey
	});
}

export async function deleteUserSecurityKeyCredential(
	userId: string,
	credentialId: Uint8Array
): Promise<boolean> {
	const result = await db
		.delete(securityKeyCredential)
		.where(
			and(eq(securityKeyCredential.id, credentialId), eq(securityKeyCredential.userId, userId))
		);

	return result.changes > 0;
}

export interface WebAuthnUserCredential {
	id: Uint8Array;
	userId: string;
	name: string;
	algorithmId: number;
	publicKey: Uint8Array;
}
