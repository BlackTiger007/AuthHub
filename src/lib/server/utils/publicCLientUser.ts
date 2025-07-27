import type { UserAuth } from '../db/schema';

export function publicUser(user: UserAuth) {
	return {
		id: user.id,
		email: user.email,
		username: user.username,
		name: user.name,
		github: !!user.githubId,
		discord: !!user.discordId,
		emailVerified: user.emailVerified,
		registeredTOTP: user.registeredTOTP,
		registeredSecurityKey: user.registeredSecurityKey,
		registeredPasskey: user.registeredPasskey,
		registered2FA: user.registered2FA
	};
}
