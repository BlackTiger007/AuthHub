<script lang="ts">
	import { encodeBase64 } from '@oslojs/encoding';
	import { createChallenge } from '$lib/client/webauthn';
	import { applyAction, deserialize } from '$app/forms';
	import type { PageProps } from './$types';
	import type { ActionResult } from '@sveltejs/kit';
	import { goto } from '$app/navigation';

	let { data, form }: PageProps = $props();

	let loading = $state(false);
	let message = $state('');

	async function registerCredential(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();
		if (!(event.currentTarget instanceof HTMLFormElement)) return;

		message = '';
		loading = true;

		const formData = new FormData(event.currentTarget);
		const action = event.currentTarget.action;

		try {
			const challenge = await createChallenge();

			const credential = await navigator.credentials.create({
				publicKey: {
					challenge,
					user: {
						displayName: data.user.username,
						id: data.credentialUserId,
						name: data.user.email
					},
					rp: { name: 'WebRetter' },
					pubKeyCredParams: [
						{ alg: -7, type: 'public-key' },
						{ alg: -257, type: 'public-key' }
					],
					attestation: 'none',
					authenticatorSelection: {
						userVerification: 'discouraged',
						residentKey: 'discouraged',
						requireResidentKey: false,
						authenticatorAttachment: 'cross-platform'
					},
					excludeCredentials: data.credentials.map((credential) => ({
						id: credential.id,
						type: 'public-key'
					}))
				}
			});

			if (!(credential instanceof PublicKeyCredential)) {
				throw new Error('Kein gültiges PublicKeyCredential');
			}
			if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
				throw new Error('Ungültige Authenticator-Antwort');
			}

			formData.append(
				'attestation_object',
				encodeBase64(new Uint8Array(credential.response.attestationObject))
			);
			formData.append(
				'client_data_json',
				encodeBase64(new Uint8Array(credential.response.clientDataJSON))
			);

			const response = await fetch(action, {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: formData
			});

			const result: ActionResult = deserialize(await response.text());

			if (result.type === 'redirect') {
				goto(result.location);
			} else {
				applyAction(result);
			}
		} catch (err) {
			message = err instanceof Error ? err.message : 'Unbekannter Fehler';
		} finally {
			loading = false;
		}
	}
</script>

<main class="bg-base-200 flex min-h-screen items-center justify-center p-6">
	<div class="card bg-base-100 w-full max-w-md shadow-xl">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">Sicherheitsschlüssel registrieren</h1>

			<form method="post" onsubmit={registerCredential} class="space-y-4">
				<label for="form-register-credential-name" class="font-medium">Name des Credentials</label>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					id="form-register-credential-name"
					name="name"
					class="input input-bordered w-full"
					placeholder="z. B. 'Mein USB-Stick'"
					autofocus
					required
				/>

				<button
					type="submit"
					class="btn btn-primary flex w-full items-center justify-center gap-2"
					disabled={loading}
					aria-busy={loading}
				>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
						<span>Wird erstellt…</span>
					{:else}
						<span>Sicherheitsschlüssel erstellen</span>
					{/if}
				</button>
			</form>

			{#if message}
				<p class="text-error text-center" role="alert" aria-live="polite">{message}</p>
			{/if}

			{#if form?.message}
				<p class="text-error text-center font-medium" role="alert" aria-live="polite">
					{form.message}
				</p>
			{/if}

			<div class="divider">Abbrechen?</div>
			<a href="/" class="btn btn-outline w-full">Zurück zur Übersicht</a>
		</div>
	</div>
</main>
