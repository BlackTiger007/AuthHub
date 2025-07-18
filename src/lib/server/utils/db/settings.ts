import * as AppSettings from '$lib/server/utils/settingsSchemas';
import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import { z } from 'zod';

// 🎯 Alle Keys aus AppSettings, z.B. "SMTP", "Discord", ...
const settingKeys = Object.keys(AppSettings) as (keyof typeof AppSettings)[];

// 🎯 Finaler Rückgabe-Typ: kein Partial mehr, alles garantiert vorhanden
type SettingsMap = {
	[K in keyof typeof AppSettings]: z.infer<(typeof AppSettings)[K]>;
};

export async function getSettings() {
	const entries = await db.select().from(schema.setting);

	// Wir füllen ein leeres Objekt im richtigen Typ
	const parsed = {} as { -readonly [K in keyof SettingsMap]: SettingsMap[K] };

	for (const key of settingKeys) {
		const schema = AppSettings[key];
		const entry = entries.find((e) => e.key === key);

		try {
			// Wert parsen oder Default aus Schema nehmen
			parsed[key] = schema.parse(entry?.value ?? {});
		} catch (err) {
			console.warn(`⚠️ Fehler beim Parsen von ${key}, verwende Default`, err);
			parsed[key] = schema.parse({});
		}
	}

	return parsed;
}

export const settings = await getSettings();
