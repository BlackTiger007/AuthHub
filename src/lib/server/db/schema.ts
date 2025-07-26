import { session, type Session } from './schema/session';
import { user, type UserAuth, type User } from './schema/user';
import { log, type Log } from './schema/log';
import { setting, type Setting } from './schema/setting';
import { account, type Account } from './schema/account';
import {
	emailVerificationRequest,
	type EmailVerificationRequest
} from './schema/email-verification-request';
import { passwordResetSession, type PasswordResetSession } from './schema/password-reset-session';
import { totpCredential, type TotpCredential } from './schema/totp-credential';
import { passkeyCredential, type PasskeyCredential } from './schema/passkey-credential';
import {
	securityKeyCredential,
	type SecurityKeyCredential
} from './schema/security-key-credential';

export const schema = {
	user,
	session,
	log,
	setting,
	account,
	emailVerificationRequest,
	passwordResetSession,
	totpCredential,
	passkeyCredential,
	securityKeyCredential
};

export {
	user,
	session,
	log,
	setting,
	account,
	emailVerificationRequest,
	passwordResetSession,
	totpCredential,
	passkeyCredential,
	securityKeyCredential
};

export interface Schema {
	UserAuth: UserAuth;
	User: User;
	Session: Session;
	Log: Log;
	Setting: Setting;
	Account: Account;
	EmailVerificationRequest: EmailVerificationRequest;
	PasswordResetSession: PasswordResetSession;
	TotpCredential: TotpCredential;
	PasskeyCredential: PasskeyCredential;
	SecurityKeyCredential: SecurityKeyCredential;
}

export type {
	UserAuth,
	User,
	Session,
	Log,
	Setting,
	Account,
	EmailVerificationRequest,
	PasswordResetSession,
	TotpCredential,
	PasskeyCredential,
	SecurityKeyCredential
};
