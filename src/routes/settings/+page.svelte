<script lang="ts">
	import { enhance } from '$app/forms';
	import Navbar from '$lib/components/navbar.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<Navbar />

<main class="mx-auto max-w-3xl space-y-10 p-6">
	<h1 class="text-center text-3xl font-bold">Einstellungen</h1>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2>E-Mail aktualisieren</h2>
		<p>Aktuelle E-Mail: <span class="font-mono">{data.user.email}</span></p>

		<form method="post" use:enhance action="?/update_email" class="flex flex-col gap-4">
			<label for="form-email-email" class="font-medium">Neue E-Mail</label>
			<input
				type="email"
				id="form-email-email"
				name="email"
				class="input input-bordered w-full"
				required
				aria-describedby="email-message"
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
		<h2>Passwort aktualisieren</h2>

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
		<h2>Authenticator-App</h2>
		{#if data.user.registeredTOTP}
			<div class="flex flex-col gap-2">
				<a href="/2fa/totp/setup" class="btn btn-outline w-full">TOTP aktualisieren</a>
				<form method="post" use:enhance action="?/disconnect_totp" class="mt-2">
					<button type="submit" class="btn btn-error w-full">Trennen</button>
				</form>
			</div>
		{:else}
			<a href="/2fa/totp/setup" class="btn btn-primary w-full">TOTP einrichten</a>
		{/if}
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2>Passkeys</h2>
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
		<a href="/2fa/passkey/register" class="btn btn-outline mt-4 w-full">Hinzufügen</a>
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2>Sicherheitsschlüssel</h2>
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
		<a href="/2fa/security-key/register" class="btn btn-outline mt-4 w-full">Hinzufügen</a>
	</section>

	<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
		<h2>OAuth Apps</h2>
		<p class="text-base-content/70 mb-4 text-sm">
			OAuth-Verknüpfungen ermöglichen den sicheren Login über externe Dienste wie GitHub oder
			Discord.
		</p>
		<ul class="space-y-3">
			<li class="bg-base-200 flex items-center justify-between rounded-md p-3">
				<p class="font-medium">GitHub</p>
				<form method="post" use:enhance action="?/delete_passkey">
					<input type="hidden" name="auth_name" value="github" />
					{#if data.user.github}
						<button type="submit" class="btn btn-sm btn-error">Löschen</button>
					{:else}
						<a href="/login/github" class="btn btn-outline w-full">OAuth-Verknüpfen</a>
					{/if}
				</form>
			</li>

			<li class="bg-base-200 flex items-center justify-between rounded-md p-3">
				<p class="font-medium">Discord</p>
				<form method="post" use:enhance action="?/delete_passkey">
					<input type="hidden" name="auth_name" value="discord" />
					{#if data.user.discord}
						<button type="submit" class="btn btn-sm btn-error">Löschen</button>
					{:else}
						<a href="/login/discord" class="btn btn-outline w-full">OAuth-Verknüpfen</a>
					{/if}
				</form>
			</li>
		</ul>
	</section>

	{#if data.recoveryCode !== null}
		<section class="card bg-base-100 space-y-4 rounded-lg p-6 shadow">
			<h2>Recovery-Code</h2>
			<p class="bg-base-200 rounded p-3 font-mono break-words select-all">{data.recoveryCode}</p>
			<form method="post" use:enhance action="?/regenerate_recovery_code" class="mt-4">
				<button type="submit" class="btn btn-warning w-full"> Neuen Code generieren </button>
			</form>
		</section>
	{/if}
</main>
