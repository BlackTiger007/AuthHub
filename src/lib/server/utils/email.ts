import { db } from '../db';
import { eq } from 'drizzle-orm';
import { user } from '../db/schema';

/**
 * Validiert die Formatierung und maximale Länge einer E-Mail-Adresse.
 */
export function verifyEmailInput(email: unknown): boolean {
	return typeof email === 'string' && /^.+@.+\..+$/.test(email) && email.length < 256;
}

/**
 * Prüft, ob die E-Mail-Adresse bereits registriert ist.
 * Gibt `true` zurück, wenn sie **frei/verfügbar** ist.
 */
export async function checkEmailAvailability(email: string): Promise<boolean> {
	const result = await db.select({ count: user.id }).from(user).where(eq(user.email, email));

	return result.length === 0;
}
