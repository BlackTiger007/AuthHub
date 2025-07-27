<script lang="ts">
	import { enhance } from '$app/forms';
	import { createChallenge } from '$lib/client/webauthn';
	import { encodeBase64 } from '@oslojs/encoding';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import github from '$lib/SVG/github.svg';
	import discord from '$lib/SVG/discord.svg';

	let { data, form }: PageProps = $props();

	let passkeyErrorMessage = $state('');

	async function passKey() {
		passkeyErrorMessage = '';
		try {
			const challenge = await createChallenge();

			const credential = await navigator.credentials.get({
				publicKey: {
					challenge,
					userVerification: 'required'
				}
			});

			if (!(credential instanceof PublicKeyCredential)) {
				throw new Error('Ungültiger Passkey-Typ');
			}
			if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
				throw new Error('Ungültige Antwort vom Authenticator');
			}

			const response = await fetch('/login/passkey', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					credential_id: encodeBase64(new Uint8Array(credential.rawId)),
					signature: encodeBase64(new Uint8Array(credential.response.signature)),
					authenticator_data: encodeBase64(new Uint8Array(credential.response.authenticatorData)),
					client_data_json: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
				})
			});

			if (response.ok) {
				goto('/');
			} else {
				passkeyErrorMessage = await response.text();
			}
		} catch (err) {
			passkeyErrorMessage =
				err instanceof Error ? err.message : 'Unbekannter Fehler beim Passkey-Login';
		}
	}
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<form class="card-body space-y-4 pb-0" method="post" use:enhance>
			<!-- Logo -->
			<!-- <div class="flex justify-center">
				<img
					src="/favicon.svg"
					alt="App Logo"
					class="border-base-300 bg-base-200 h-16 w-16 rounded-full border p-1"
				/>
			</div> -->
			<h1 class="text-center text-3xl font-bold">Anmelden</h1>

			<div>
				<label for="form-login.email" class="label">
					<span class="label-text">E-Mail-Adresse</span>
				</label>
				<input
					id="form-login.email"
					name="email"
					type="email"
					class="input w-full"
					autocomplete="email"
					required
				/>
			</div>

			<div class="m-0">
				<label for="form-login.password" class="label">
					<span class="label-text">Passwort</span>
				</label>
				<input
					id="form-login.password"
					name="password"
					type="password"
					class="input w-full"
					autocomplete="current-password"
					required
				/>
			</div>

			<div class="mb-0 flex justify-between text-sm">
				<a href="/forgot-password" class="link link-hover text-primary">Passwort vergessen?</a>
			</div>

			<button type="submit" class="btn btn-neutral mt-2 w-full">Mit Passwort anmelden</button>

			{#if form?.message && typeof form.message === 'string'}
				<p class="text-error text-center" aria-live="polite">{form.message}</p>
			{/if}

			<a href="/signup" class="link link-hover text-primary text-center">
				Noch kein Konto? Jetzt registrieren
			</a>
		</form>

		<div class="divider">oder</div>

		<div class="flex flex-col gap-2 px-6 pb-6">
			<button class="btn btn-outline" onclick={passKey} type="button">
				Mit Passkey anmelden
			</button>

			{#if passkeyErrorMessage}
				<p class="text-error text-sm" aria-live="polite">{passkeyErrorMessage}</p>
			{/if}

			{#if data.discord}
				<a href="/login/discord" class="btn btn-outline flex items-center gap-3">
					<img src={discord} alt="Discord Logo" class="size-6" />
					<span>Mit Discord anmelden</span>
				</a>
			{/if}

			{#if data.github}
				<a href="/login/github" class="btn btn-outline flex items-center gap-3">
					<img src={github} alt="GitHub Logo" class="size-6" />
					<span>Mit GitHub anmelden</span>
				</a>
			{/if}
		</div>
	</div>
</main>
