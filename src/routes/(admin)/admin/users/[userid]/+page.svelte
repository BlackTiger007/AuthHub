<script lang="ts">
	import { enhance } from '$app/forms';
	import { Role, RoleLabels } from '$lib/utils/roles';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const roles = Object.entries(RoleLabels) as unknown as [Role, string][];

	function formatDate(dateString: Date) {
		const date = new Date(dateString);
		return date.toLocaleString('de-DE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<main class="mx-auto max-w-5xl space-y-10 p-6">
	<header class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Benutzerdetails</h1>
		<a href="/admin/users" class="btn btn-sm btn-outline">Zurück zur Übersicht</a>
	</header>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2 class="text-xl font-semibold">Systemdaten</h2>
		<div class="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
			<p><strong>ID:</strong> {data.user.id}</p>
			<p><strong>Rolle:</strong> {Role[data.user.role]}</p>
			<p><strong>Erstellt am:</strong> {formatDate(data.user.createdAt)}</p>
			<p><strong>Letzte Änderung:</strong> {formatDate(data.user.updatedAt)}</p>
			<p>
				<strong>Letzter Login:</strong>
				{data.user.lastLogin ? formatDate(data.user.lastLogin) : '-'}
			</p>
			<p>
				<strong>Status:</strong>
				{#if data.user.emailVerified}
					<span class="badge badge-success">Verifiziert</span>
				{:else}
					<span class="badge badge-warning">Nicht verifiziert</span>
				{/if}
			</p>
		</div>
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2 class="text-xl font-semibold">E-Mail aktualisieren</h2>
		<p>Aktuelle E-Mail: <span class="font-mono">{data.user.email}</span></p>
		<form method="post" use:enhance action="?/update_email" class="flex flex-col gap-4">
			<label for="form-email-email" class="font-medium">Neue E-Mail</label>
			<input
				type="email"
				id="form-email-email"
				name="email"
				class="input input-bordered w-full"
				aria-describedby="email-message"
				required
			/>
			<button type="submit" class="btn btn-primary w-full">Aktualisieren</button>
			{#if form?.email?.message}
				<p id="email-message" class="text-error font-medium" role="alert" aria-live="polite">
					{form.email.message}
				</p>
			{/if}
		</form>
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2 class="text-xl font-semibold">Passwort aktualisieren</h2>
		<form method="post" use:enhance action="?/update_password" class="flex flex-col gap-4">
			<label for="form-password-current" class="font-medium">Aktuelles Passwort</label>
			<input
				type="password"
				id="form-password-current"
				name="password"
				autocomplete="current-password"
				class="input input-bordered w-full"
				required
				aria-describedby="password-message"
			/>

			<label for="form-password-new" class="font-medium">Neues Passwort</label>
			<input
				type="password"
				id="form-password-new"
				name="new_password"
				autocomplete="new-password"
				class="input input-bordered w-full"
				required
			/>

			<button type="submit" class="btn btn-primary w-full">Aktualisieren</button>

			{#if form?.password?.message}
				<p id="password-message" class="text-error font-medium" role="alert" aria-live="polite">
					{form.password.message}
				</p>
			{/if}
		</form>
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2 class="text-xl font-semibold">Authenticator-App</h2>
		{#if data.user.registeredTOTP}
			<div class="flex flex-col gap-2">
				<form method="post" use:enhance action="?/disconnect_totp" class="mt-2">
					<button type="submit" class="btn btn-error w-full">Trennen</button>
				</form>
			</div>
		{:else}
			<a href="/2fa/totp/setup" class="btn btn-primary w-full">TOTP einrichten</a>
		{/if}
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2 class="text-xl font-semibold">Passkeys</h2>
		<p class="text-base-content/70 mb-4 text-sm">
			Passkeys sind WebAuthn-Zugangsdaten, die Ihre Identität per Gerät bestätigen.
		</p>
		<ul class="space-y-3">
			{#each data.passkeyCredentials as credential}
				<li class="bg-base-200 flex items-center justify-between rounded-md p-3">
					<p class="font-medium">{credential.name}</p>
					<form method="post" use:enhance action="?/delete_passkey">
						<input type="hidden" name="credential_id" value={credential.id} />
						<button type="submit" class="btn btn-sm btn-error">Löschen</button>
					</form>
				</li>
			{/each}
		</ul>
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2 class="text-xl font-semibold">Sicherheitsschlüssel</h2>
		<p class="text-base-content/70 mb-4 text-sm">
			Sicherheitsschlüssel sind WebAuthn-Zugangsdaten, die ausschließlich für die
			Zwei-Faktor-Authentifizierung verwendet werden.
		</p>
		<ul class="space-y-3">
			{#each data.securityKeyCredentials as credential}
				<li class="bg-base-200 flex items-center justify-between rounded-md p-3">
					<p class="font-medium">{credential.name}</p>
					<form method="post" use:enhance action="?/delete_security_key">
						<input type="hidden" name="credential_id" value={credential.id} />
						<button type="submit" class="btn btn-sm btn-error">Löschen</button>
					</form>
				</li>
			{/each}
		</ul>
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2 class="text-xl font-semibold">OAuth Apps</h2>
		<p class="text-base-content/70 mb-4 text-sm">
			OAuth-Verknüpfungen ermöglichen den sicheren Login über externe Dienste wie GitHub oder
			Discord.
		</p>
		<ul class="space-y-3">
			{#if data.user.github}
				<li class="bg-base-200 flex items-center justify-between rounded-md p-3">
					<p class="font-medium">GitHub</p>
					<form method="post" use:enhance action="?/delete_oauth">
						<input type="hidden" name="auth_name" value="github" />
						<button type="submit" class="btn btn-sm btn-error">Löschen</button>
					</form>
				</li>
			{/if}

			{#if data.user.discord}
				<li class="bg-base-200 flex items-center justify-between rounded-md p-3">
					<p class="font-medium">Discord</p>
					<form method="post" use:enhance action="?/delete_oauth">
						<input type="hidden" name="auth_name" value="discord" />
						<button type="submit" class="btn btn-sm btn-error">Löschen</button>
					</form>
				</li>
			{/if}
		</ul>

		{#if form?.auth?.message}
			<p id="password-message" class="text-error font-medium" role="alert" aria-live="polite">
				{form.auth.message}
			</p>
		{/if}
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2 class="text-xl font-semibold">Recovery-Code</h2>
		<form method="post" use:enhance action="?/regenerate_recovery_code">
			<label for="regenerate-recovery-code" class="fieldset-legend w-fit">
				Bist du dir Sicher?
				<input type="checkbox" id="regenerate-recovery-code" class="checkbox" required />
			</label>

			<button type="submit" class="btn btn-warning w-full">Neuen Code generieren</button>
			{#if form?.form === 'regenerate_recovery_code'}
				<p class={form.success ? 'text-success' : 'text-error'}>
					{form.success ? form.message : JSON.stringify(form.message, null, 2)}
				</p>
			{/if}
		</form>
	</section>
</main>
