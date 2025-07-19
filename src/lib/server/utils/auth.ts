import { getRequestEvent } from '$app/server';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { redirect } from '@sveltejs/kit';
import { settings } from '../store.svelte';

/**
 * Erzwingt ein aktives Login, sonst Redirect zur Login-Seite.
 * @returns Der eingeloggte User aus locals
 */
export function requireLogin() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(302, '/login');
	}

	return locals.user;
}

/**
 * Generiert eine User-ID mit 120 Bit Entropie (Base32)
 * Entspricht etwa der Sicherheit einer UUID v4.
 * @returns Generierte User-ID als String
 */
export function generateId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}

/**
 * Prüft einen Usernamen auf Gültigkeit.
 * - Länge: 3 bis 31 Zeichen
 * - Erlaubte Zeichen: Großbuchstaben, Kleinbuchstaben, Ziffern, Unterstrich und Bindestrich
 * @param username Zu prüfender Wert
 * @returns true wenn gültig, sonst false
 */
export function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[A-Za-z0-9_-]+$/.test(username)
	);
}

/**
 * Prüft ein Passwort auf Gültigkeit gemäß den konfigurierten Einstellungen.
 * - Mindestlänge
 * - Enthaltene Zeichentypen (Groß-, Kleinbuchstaben, Zahlen, Symbole)
 * - Ausschluss bestimmter Zeichen
 * @param password Zu prüfender Wert
 * @returns true wenn gültig, sonst false
 */
export function validatePassword(password: unknown): password is string {
	if (typeof password !== 'string') return false;

	const config = settings.Password;
	console.log(config);

	if (password.length < config.length || password.length > 255) return false;

	if (config.exclude) {
		for (const char of password) {
			if (config.exclude.includes(char)) return false;
		}
	}

	if (config.uppercase && !/[A-Z]/.test(password)) return false;
	if (config.lowercase && !/[a-z]/.test(password)) return false;
	if (config.numbers && !/\d/.test(password)) return false;
	if (config.symbols && !/[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password)) return false;

	return true;
}

/**
 * Prüft eine E-Mail-Adresse auf ein einfaches, valides Format.
 * (RFC-konform wäre komplexer, das hier reicht für 99% der Fälle)
 * @param email Zu prüfender Wert
 * @returns true wenn gültige E-Mail-Adresse, sonst false
 */
export function validateEmail(email: unknown): email is string {
	return (
		typeof email === 'string' &&
		email.length >= 5 &&
		email.length <= 255 &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
	);
}
