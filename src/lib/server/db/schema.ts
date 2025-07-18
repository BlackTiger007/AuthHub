import { session, type Session } from './schema/session';
import { user, type User } from './schema/user';
import { log, type Log } from './schema/log';
import { setting, type Setting } from './schema/setting';

export const schema = {
	user,
	session,
	log,
	setting
};

export { user, session, log, setting };

export interface Schema {
	User: User;
	Session: Session;
	Log: Log;
	Setting: Setting;
}

export type { User, Session, Log, Setting };
