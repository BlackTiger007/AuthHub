import { session, type Session } from './schema/session';
import { user, type User } from './schema/user';
import { log, type Log } from './schema/log';
import { setting, type Setting } from './schema/setting';
import { account, type Account } from './schema/account';

export const schema = {
	user,
	session,
	log,
	setting,
	account
};

export { user, session, log, setting, account };

export interface Schema {
	User: User;
	Session: Session;
	Log: Log;
	Setting: Setting;
	Account: Account;
}

export type { User, Session, Log, Setting, Account };
