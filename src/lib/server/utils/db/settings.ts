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

	const parsed = {} as Record<keyof typeof AppSettings, unknown>;

	for (const key of settingKeys) {
		const schemaZod = AppSettings[key];
		const entry = entries.find((e) => e.key === key);

		// Wenn kein Eintrag da ist, dann Default vom Schema verwenden
		if (!entry) {
			parsed[key] = schemaZod.parse({}); // leerer Input = Default-Werte vom Schema
		} else {
			parsed[key] = schemaZod.parse(entry.value ?? {}); // vorhandene Daten validieren
		}
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
