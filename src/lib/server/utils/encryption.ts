import { decodeBase64 } from '@oslojs/encoding';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { DynamicBuffer } from '@oslojs/binary';
import { env } from '$env/dynamic/private';

/**
 * Holt und dekodiert den Schlüssel aus der ENV-Variable.
 * Wird bei jedem Aufruf neu aufgelöst (runtime).
 *
 * @throws Wenn ENCRYPTION_KEY nicht gesetzt oder ungültig ist
 */
function getKey(): Uint8Array {
	const key = env.ENCRYPTION_KEY;
	if (!key) throw new Error('ENCRYPTION_KEY is not set');
	return decodeBase64(key);
}

/**
 * Verschlüsselt beliebige Binärdaten (z. B. Strings oder JSON) mit AES-128-GCM.
 *
 * - Generiert bei jedem Aufruf einen zufälligen IV (Initialisierungsvektor)
 * - Fügt den IV und das AuthTag dem verschlüsselten Payload hinzu
 * - Liefert ein vollständiges, selbstentschlüsselbares Bytepaket zurück
 *
 * @param data - Die zu verschlüsselnden Daten als Uint8Array
 * @returns Das verschlüsselte Ergebnis inkl. IV und AuthTag
 */
export function encrypt(data: Uint8Array): Uint8Array {
	const iv = randomBytes(16);
	const cipher = createCipheriv('aes-128-gcm', getKey(), iv);

	const encrypted = new DynamicBuffer(0);
	encrypted.write(iv);
	encrypted.write(cipher.update(data));
	encrypted.write(cipher.final());
	encrypted.write(cipher.getAuthTag());

	return encrypted.bytes();
}

/**
 * Verschlüsselt einen String mithilfe von `encrypt()` und UTF-8-Encoding.
 *
 * @param data - Der zu verschlüsselnde Text
 * @returns Verschlüsseltes Ergebnis als Uint8Array
 */
export function encryptString(data: string): Uint8Array {
	return encrypt(new TextEncoder().encode(data));
}

/**
 * Entschlüsselt ein zuvor mit `encrypt()` erzeugtes Bytepaket.
 *
 * Erwartet:
 * - Erste 16 Byte: IV
 * - Letzte 16 Byte: AuthTag
 * - Dazwischen: Ciphertext
 *
 * @param encrypted - Das verschlüsselte Bytepaket
 * @returns Die entschlüsselten Originaldaten als Uint8Array
 * @throws Bei ungültigem Format oder fehlerhafter Authentifizierung
 */
export function decrypt(encrypted: Uint8Array): Uint8Array {
	if (encrypted.byteLength < 33) {
		throw new Error('Invalid data');
	}

	const iv = encrypted.slice(0, 16);
	const tag = encrypted.slice(encrypted.byteLength - 16);
	const payload = encrypted.slice(16, encrypted.byteLength - 16);

	const decipher = createDecipheriv('aes-128-gcm', getKey(), iv);
	decipher.setAuthTag(tag);

	const decrypted = new DynamicBuffer(0);
	decrypted.write(decipher.update(payload));
	decrypted.write(decipher.final());

	return decrypted.bytes();
}

/**
 * Entschlüsselt ein verschlüsseltes Bytepaket und wandelt es in einen String um.
 *
 * @param data - Verschlüsselter Text als Uint8Array
 * @returns Entschlüsselter Klartext als UTF-8-String
 */
export function decryptToString(data: Uint8Array): string {
	return new TextDecoder().decode(decrypt(data));
}
