import { encodeBase32LowerCase } from '@oslojs/encoding';

/**
 * Generiert eine User-ID mit 120 Bit Entropie (Base32)
 * Entspricht etwa der Sicherheit einer UUID v4.
 * @returns Generierte User-ID als String
 */
export function generateId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
