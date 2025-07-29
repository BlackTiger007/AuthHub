import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0,
	environment: import.meta.env.MODE,

	// Enable logs to be sent to Sentry
	enableLogs: true
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
