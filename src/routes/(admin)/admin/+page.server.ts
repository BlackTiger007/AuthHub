import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/utils/session';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireLogin } from '$lib/server/utils/auth';
import { writeLog } from '$lib/server/utils/db/log';
import { LogEvent } from '$lib/utils/events';
import { db } from '$lib/server/db';
import { schema } from '$lib/server/db/schema';
import { and, gte, lt } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const user = requireLogin();

	const now = new Date();
	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);

	const yesterday = new Date(startOfToday);
	yesterday.setDate(yesterday.getDate() - 1);

	const sevenDaysAgo = new Date(now);
	sevenDaysAgo.setDate(now.getDate() - 7);

	const fourteenDaysAgo = new Date(now);
	fourteenDaysAgo.setDate(now.getDate() - 14);

	const startOfMonth = new Date(now);
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const startOfPreviousMonth = new Date(startOfMonth);
	startOfPreviousMonth.setMonth(startOfMonth.getMonth() - 1);

	// Userzahlen
	const totalUsers = await db.$count(schema.user);

	const newUsersToday = await db.$count(schema.user, gte(schema.user.createdAt, startOfToday));

	const newUsersYesterday = await db.$count(
		schema.user,
		and(gte(schema.user.createdAt, yesterday), lt(schema.user.createdAt, startOfToday))
	);

	const newUsersLast7Days = await db.$count(schema.user, gte(schema.user.createdAt, sevenDaysAgo));

	const newUsersPrevious7Days = await db.$count(
		schema.user,
		and(gte(schema.user.createdAt, fourteenDaysAgo), lt(schema.user.createdAt, sevenDaysAgo))
	);

	// Sessions
	const dailyActiveUsers = await db.$count(
		schema.session,
		gte(schema.session.lastActiveAt, startOfToday)
	);

	const yesterdayActiveUsers = await db.$count(
		schema.session,
		and(gte(schema.session.lastActiveAt, yesterday), lt(schema.session.lastActiveAt, startOfToday))
	);

	const weeklyActiveUsers = await db.$count(
		schema.session,
		gte(schema.session.lastActiveAt, sevenDaysAgo)
	);

	const previousWeeklyActiveUsers = await db.$count(
		schema.session,
		and(
			gte(schema.session.lastActiveAt, fourteenDaysAgo),
			lt(schema.session.lastActiveAt, sevenDaysAgo)
		)
	);

	const monthlyActiveUsers = await db.$count(
		schema.session,
		gte(schema.session.lastActiveAt, startOfMonth)
	);

	const previousMonthlyActiveUsers = await db.$count(
		schema.session,
		and(
			gte(schema.session.lastActiveAt, startOfPreviousMonth),
			lt(schema.session.lastActiveAt, startOfMonth)
		)
	);

	// Trend-Berechnungen
	const trendNewToday = newUsersToday - newUsersYesterday;
	const trendLast7Days = newUsersLast7Days - newUsersPrevious7Days;
	const trendDailyActive = dailyActiveUsers - yesterdayActiveUsers;
	const trendWeeklyActive = weeklyActiveUsers - previousWeeklyActiveUsers;
	const trendMonthlyActive = monthlyActiveUsers - previousMonthlyActiveUsers;

	return {
		user,
		totalUsers,
		newUsersToday,
		newUsersLast7Days,
		dailyActiveUsers,
		weeklyActiveUsers,
		monthlyActiveUsers,
		trendNewToday,
		trendLast7Days,
		trendDailyActive,
		trendWeeklyActive,
		trendMonthlyActive
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);

		await writeLog(event, LogEvent.UserLogout);

		return redirect(302, '/login');
	}
};
