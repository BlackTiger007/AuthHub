import { generateRandomRecoveryCode } from './utils';
import { ExpiringTokenBucket } from './rate-limit';
import { decryptToString, encryptString } from './encryption';
import { db } from '../db';
import { schema } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import type { UserAuth } from '../db/schema';

// Rate-Limiting für Recovery-Code-Nutzung (3 Versuche pro Stunde)
export const recoveryCodeBucket = new ExpiringTokenBucket<string>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(
	userId: string,
	recoveryCode: string
): Promise<boolean> {
	const rows = await db
		.select({ recoveryCode: schema.user.recoveryCode })
		.from(schema.user)
		.where(eq(schema.user.id, userId))
		.limit(1);

	if (rows.length === 0 || !rows[0].recoveryCode) {
		return false;
	}

	// Cast oder Umwandlung zu Uint8Array
	const encryptedCode = rows[0].recoveryCode;
	const decryptedCode = decryptToString(encryptedCode);

	if (recoveryCode !== decryptedCode) {
		return false;
	}

	const newRecoveryCode = generateRandomRecoveryCode();
	const encryptedNewRecoveryCode = encryptString(newRecoveryCode);

	try {
		await db.transaction(async (tx) => {
			const result = await tx
				.update(schema.user)
				.set({ recoveryCode: encryptedNewRecoveryCode })
				.where(and(eq(schema.user.id, userId), eq(schema.user.recoveryCode, rows[0].recoveryCode)));

			if (result.changes === 0) {
				throw new Error('Recovery code mismatch or already updated.');
			}

			await Promise.all([
				tx
					.update(schema.session)
					.set({ twoFactorVerified: false })
					.where(eq(schema.session.userId, userId)),
				tx.delete(schema.totpCredential).where(eq(schema.totpCredential.userId, userId)),
				tx.delete(schema.passkeyCredential).where(eq(schema.passkeyCredential.userId, userId)),
				tx
					.delete(schema.securityKeyCredential)
					.where(eq(schema.securityKeyCredential.userId, userId))
			]);
		});
	} catch (e) {
		console.error('Transaction failed:', e);
		return false;
	}

	return true;
}

export function get2FARedirect(user: UserAuth): string {
	if (user.registeredPasskey) return '/2fa/passkey';
	if (user.registeredSecurityKey) return '/2fa/security-key';
	if (user.registeredTOTP) return '/2fa/totp';
	return '/2fa/setup';
}

export function getPasswordReset2FARedirect(user: UserAuth): string {
	if (user.registeredPasskey) return '/reset-password/2fa/passkey';
	if (user.registeredSecurityKey) return '/reset-password/2fa/security-key';
	if (user.registeredTOTP) return '/reset-password/2fa/totp';
	return '/2fa/setup';
}
