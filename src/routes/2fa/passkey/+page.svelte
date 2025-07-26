<script lang="ts">
	import { goto } from '$app/navigation';
	import { decodeBase64, encodeBase64 } from '@oslojs/encoding';
	import { createChallenge } from '$lib/client/webauthn';

	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	let message = $state('');
	let loading = $state(false);

	async function authenticateWithPasskey() {
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
				throw new Error('Ungültiger Passkey-Typ');
			}
			if (!(credential.response instanceof AuthenticatorAssertionResponse)) {
				throw new Error('Ungültige Antwort vom Authenticator');
			}

			const res = await fetch('/2fa/passkey', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					credential_id: encodeBase64(new Uint8Array(credential.rawId)),
					signature: encodeBase64(new Uint8Array(credential.response.signature)),
					authenticator_data: encodeBase64(new Uint8Array(credential.response.authenticatorData)),
					client_data_json: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
				})
			});

			if (res.ok) {
				goto('/');
			} else {
				message = await res.text();
			}
		} catch (err) {
			message = err instanceof Error ? err.message : 'Unbekannter Fehler bei der Authentifizierung';
		} finally {
			loading = false;
		}
	}
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<div class="card-body space-y-4">
			<h1>Mit Passkey authentifizieren</h1>

			<button
				class="btn btn-neutral m-0 w-full"
				onclick={authenticateWithPasskey}
				disabled={loading}
			>
				{#if loading}
					<span class="loading loading-spinner"></span>
					<span>Authentifiziere…</span>
				{:else}
					Passkey verwenden
				{/if}
			</button>

			{#if message}
				<p class="text-error text-center" aria-live="polite">{message}</p>
			{/if}

			<div class="divider">oder</div>

			<a href="/2fa/reset" class="btn btn-outline w-full">Recovery Code verwenden</a>

			{#if data.user.registeredTOTP}
				<a href="/2fa/totp" class="btn btn-outline w-full">Authenticator-App verwenden</a>
			{/if}

			{#if data.user.registeredSecurityKey}
				<a href="/2fa/security-key" class="btn btn-outline w-full">
					Sicherheitsschlüssel verwenden
				</a>
			{/if}
		</div>
	</div>
</main>
