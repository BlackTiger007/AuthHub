import { hash } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import {
	generateId,
	validateEmail,
	validatePassword,
	validateUsername
} from '$lib/server/utils/auth';
import { writeLog } from '$lib/server/utils/db/log';
import { LogEvent } from '$lib/utils/events';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (!validateUsername(username)) {
			return fail(400, { message: 'Invalid username' });
		}

		if (!validateEmail(email)) {
			return fail(400, { message: 'Invalid email' });
		}

		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Invalid confirm password' });
		}

		const userId = generateId();
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			await db.insert(table.user).values({
				id: userId,
				username,
				email,
				passwordHash,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch {
			return fail(500, { message: 'An error has occurred' });
		}

		await writeLog(event, LogEvent.UserCreated);

		return redirect(302, '/admin');
	}
};
