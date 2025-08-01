import type { Session, UserAuth } from '$lib/server/db/schema';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		interface Locals {
			user: UserAuth | null;
			session: Session | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
