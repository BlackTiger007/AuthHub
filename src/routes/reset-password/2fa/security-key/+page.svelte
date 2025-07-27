<script lang="ts">
	import { goto } from '$app/navigation';
	import { decodeBase64, encodeBase64 } from '@oslojs/encoding';
	import { createChallenge } from '$lib/client/webauthn';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let message = $state('');
	let loading = $state(false);

	async function authenticateWithSecurityKey() {
		message = '';
		loading = true;

		try {
			const challenge = await createChallenge();

			const credential = await navigator.credentials.get({
				publicKey: {
					challenge,
					userVerification: 'discouraged',
					allowCredentials: data.credentials.map((credential) => ({
						id: decodeBase64(credential.id),
						type: 'public-key'
					}))
				}
			});

			if (!(credential instanceof PublicKeyCredential)) {
				throw new Error('Failed to create public key');
			}
			if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
				throw new Error('Unexpected error');
			}

			const response = await fetch('/reset-password/2fa/security-key', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					credential_id: encodeBase64(new Uint8Array(credential.rawId)),
					signature: encodeBase64(new Uint8Array(credential.response.signature)),
					authenticator_data: encodeBase64(new Uint8Array(credential.response.authenticatorData)),
					client_data_json: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
				})
			});

			if (response.ok) {
				goto('/reset-password');
			} else {
				message = await response.text();
			}
		} catch (err) {
			message = err instanceof Error ? err.message : 'Unbekannter Fehler';
		} finally {
			loading = false;
		}
	}
</script>

<main
	class="text-base-content bg-base-200 flex min-h-screen flex-col items-center justify-center p-6"
>
	<div class="card bg-base-100 w-full max-w-md rounded-lg shadow-xl">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">Mit Sicherheitsschlüssel authentifizieren</h1>

			<button
				class="btn btn-primary flex w-full items-center justify-center gap-2"
				onclick={authenticateWithSecurityKey}
				disabled={loading}
				aria-busy={loading}
			>
				{#if loading}
					<span class="loading loading-spinner loading-lg"></span>
					<span>Authentifiziere…</span>
				{:else}
					Sicherheitsschlüssel verwenden
				{/if}
			</button>

			{#if message}
				<p class="text-error text-center font-medium" role="alert" aria-live="polite">
					{message}
				</p>
			{/if}

			<div class="divider" aria-hidden="true">oder</div>

			<a
				href="/reset-password/2fa/recovery-code"
				class="btn btn-outline w-full"
				aria-label="Recovery Code verwenden"
			>
				Recovery Code verwenden
			</a>

			{#if data.user.registeredPasskey}
				<a
					href="/reset-password/2fa/passkey"
					class="btn btn-outline w-full"
					aria-label="Passkey verwenden"
				>
					Passkey verwenden
				</a>
			{/if}

			{#if data.user.registeredTOTP}
				<a
					href="/reset-password/2fa/totp"
					class="btn btn-outline w-full"
					aria-label="Authenticator-App verwenden"
				>
					Authenticator-App verwenden
				</a>
			{/if}
		</div>
	</div>
</main>
