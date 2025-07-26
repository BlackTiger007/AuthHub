import { eq } from 'drizzle-orm';
import { db } from '../db';
import { decrypt, encrypt } from './encryption';
import { ExpiringTokenBucket, RefillingTokenBucket } from './rate-limit';
import { totpCredential } from '../db/schema'; // ← Passe ggf. den Importpfad an

export const totpBucket = new ExpiringTokenBucket<string>(5, 60 * 30);
export const totpUpdateBucket = new RefillingTokenBucket<string>(3, 60 * 10);

/**
 * Gibt den entschlüsselten TOTP-Key eines Nutzers zurück.
 * @throws Wenn kein Eintrag für die `userId` gefunden wurde.
 */
export function getUserTOTPKey(userId: string): Uint8Array | null {
	const [row] = db
		.select({ key: totpCredential.key })
		.from(totpCredential)
		.where(eq(totpCredential.userId, userId))
		.limit(1)
		.all();

	if (!row) {
		throw new Error('Invalid user ID');
	}

	if (!row.key) {
		return null;
	}

	return decrypt(row.key);
}

/**
 * Setzt einen neuen TOTP-Key für einen Nutzer. Bestehende werden entfernt.
 */
export function updateUserTOTPKey(userId: string, key: Uint8Array): void {
	const encrypted = encrypt(key);

	db.transaction(() => {
		db.delete(totpCredential).where(eq(totpCredential.userId, userId)).run();
		db.insert(totpCredential).values({ userId, key: encrypted }).run();
	});
}

/**
 * Löscht den TOTP-Key eines Nutzers.
 */
export function deleteUserTOTPKey(userId: string): void {
	db.delete(totpCredential).where(eq(totpCredential.userId, userId)).run();
}
