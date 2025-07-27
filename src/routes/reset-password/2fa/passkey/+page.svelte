<script lang="ts">
	import { goto } from '$app/navigation';
	import { decodeBase64, encodeBase64 } from '@oslojs/encoding';
	import { createChallenge } from '$lib/client/webauthn';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let message = $state('');

	async function authenticateWithPasskey(): Promise<void> {
		try {
			const challenge = await createChallenge();
			const publicKey: PublicKeyCredentialRequestOptions = {
				challenge: challenge,
				userVerification: 'discouraged',
				allowCredentials: data.credentials.map((credential) => ({
					id: decodeBase64(credential.id),
					type: 'public-key'
				}))
			};

			const credential = await navigator.credentials.get({ publicKey });

			if (!(credential instanceof PublicKeyCredential)) {
				throw new Error('Invalid credential response');
			}

			const { rawId, response } = credential;

			if (!(response instanceof AuthenticatorAssertionResponse)) {
				throw new Error('Invalid response structure');
			}

			const result = await fetch('/reset-password/2fa/passkey', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					credential_id: encodeBase64(new Uint8Array(rawId)),
					signature: encodeBase64(new Uint8Array(response.signature)),
					authenticator_data: encodeBase64(new Uint8Array(response.authenticatorData)),
					client_data_json: encodeBase64(new Uint8Array(response.clientDataJSON))
				})
			});

			if (result.ok) {
				goto('/reset-password');
			} else {
				message = await result.text();
			}
		} catch (err) {
			console.error(err);
			message = 'Authentication failed.';
		}
	}
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<div class="card-body space-y-6">
			<h1>Authenticate with Passkeys</h1>

			<div class="space-y-2">
				<button type="button" class="btn btn-primary w-full" onclick={authenticateWithPasskey}>
					Authenticate
				</button>

				{#if message}
					<p class="text-error text-center text-sm">{message}</p>
				{/if}
			</div>

			<div class="divider">or</div>

			<nav class="space-y-2 text-sm">
				<a href="/reset-password/2fa/recovery-code" class="link link-hover block text-center">
					Use Recovery Code
				</a>

				{#if data.user.registeredSecurityKey}
					<a href="/reset-password/2fa/security-key" class="link link-hover block text-center">
						Use Security Key
					</a>
				{/if}

				{#if data.user.registeredTOTP}
					<a href="/reset-password/2fa/totp" class="link link-hover block text-center">
						Use Authenticator App
					</a>
				{/if}
			</nav>
		</div>
	</div>
</main>
