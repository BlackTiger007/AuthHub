import { verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';
import { validateEmail, validatePassword, validateUsername } from '$lib/server/utils/auth';
import { writeLog } from '$lib/server/utils/db/log';
import { LogEvent } from '$lib/utils/events';
import { schema } from '$lib/server/db/schema';
import { settings } from '$lib/server/store.svelte';

export const load: PageServerLoad = async (event) => {
	if (event.locals.session !== null && event.locals.user !== null) {
		return redirect(302, '/');
	}

	const discord =
		settings.Discord.clientID &&
		settings.Discord.clientSecret &&
		settings.Discord.scopes.length > 0;
	const github =
		settings.GitHub.clientID && settings.GitHub.clientSecret && settings.GitHub.scopes.length > 0;

	return { discord, github };
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, {
				message: 'Invalid username (min 3, max 31 characters, alphanumeric only)'
			});
		}

		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email' });
		}

		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
		}

		const results = await db.select().from(schema.user).where(eq(schema.user.email, email));

		const existingUser = results.at(0);

		if (!existingUser) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		if (existingUser.passwordHash === null) {
			return fail(400, {
				message:
					'This account was created via an external provider (e.g., Discord) and does not have a password. Please sign in using the respective provider.'
			});
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return fail(400, { message: 'Incorrect email or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		await db
			.update(schema.user)
			.set({ lastLogin: new Date() })
			.where(eq(schema.user.id, existingUser.id));

		await writeLog(event, LogEvent.UserLogin, { userId: existingUser.id });

		return redirect(302, '/admin');
	}
};
