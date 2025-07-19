import * as AppSettings from '$lib/server/utils/settingsSchemas';
import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import { z } from 'zod';
import { settings } from '$lib/server/store.svelte';

// 🎯 Alle Keys aus AppSettings, z.B. "SMTP", "Discord", ...
const settingKeys = Object.keys(AppSettings) as (keyof typeof AppSettings)[];

// 🎯 Finaler Rückgabe-Typ: kein Partial mehr, alles garantiert vorhanden
type SettingsMap = {
	[K in keyof typeof AppSettings]: z.infer<(typeof AppSettings)[K]>;
};

export async function getSettings() {
	const entries = await db.select().from(schema.setting);

	// Wir füllen ein leeres Objekt im richtigen Typ
	const parsed = {} as Record<keyof typeof AppSettings, unknown>;

	for (const key of settingKeys) {
		const schemaZod = AppSettings[key];
		const entry = entries.find((e) => e.key === key);

		const parsedValue = schemaZod.parse(entry?.value ?? {});
		parsed[key] = parsedValue;
	}

	return parsed as SettingsMap;
}

/**
 * Speichert die übergebenen Settings in der Datenbank.
 * Jeder Bereich wird validiert und als JSON gespeichert.
 *
 * @param updatedSettings Ein vollständiges Settings-Objekt (z.B. aus dem Formular)
 */
export async function saveSettings() {
	for (const key of settingKeys) {
		const schemaZod = AppSettings[key];
		const data = settings[key];

		// Vor dem Speichern validieren
		const parsed = schemaZod.parse(data);

		await db
			.insert(schema.setting)
			.values({ key, value: parsed })
			.onConflictDoUpdate({
				target: schema.setting.key,
				set: { value: parsed }
			});
	}
}
