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

	async function registerPasskey(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();

		if (!(event.currentTarget instanceof HTMLFormElement)) {
			throw new Error('currentTarget ist kein HTMLFormElement');
		}

		message = '';
		loading = true;
		const action = event.currentTarget.action;

		// Erstelle ein virtuelles FormData-Objekt
		const formData = new FormData(event.currentTarget);

		try {
			const challenge = await createChallenge();

			const credential = await navigator.credentials.create({
				publicKey: {
					challenge,
					user: {
						id: data.credentialUserId,
						name: data.user.email,
						displayName: data.user.username
					},
					rp: { name: 'WebRetter' },
					pubKeyCredParams: [
						{ alg: -7, type: 'public-key' },
						{ alg: -257, type: 'public-key' }
					],
					attestation: 'none',
					authenticatorSelection: {
						userVerification: 'required',
						residentKey: 'required',
						requireResidentKey: true
					},
					excludeCredentials: data.credentials.map((credential) => ({
						id: credential.id,
						type: 'public-key'
					}))
				}
			});

			if (!(credential instanceof PublicKeyCredential)) {
				throw new Error('Ungültige Rückgabe: Kein PublicKeyCredential');
			}
			if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
				throw new Error('Ungültige Authenticator-Antwort');
			}

			const encodedAttestationObject = encodeBase64(
				new Uint8Array(credential.response.attestationObject)
			);
			const encodedClientDataJSON = encodeBase64(
				new Uint8Array(credential.response.clientDataJSON)
			);

			formData.append('attestation_object', encodedAttestationObject);
			formData.append('client_data_json', encodedClientDataJSON);

			// Simuliere eine POST-Anfrage mit FormData an dein Backend-Formularhandler
			const response = await fetch(action, {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: formData
			});

			const result: ActionResult = deserialize(await response.text());

			if (result.type === 'redirect') {
				goto(result.location);
				return;
			} else {
				// Fehler im Formular verarbeiten
				applyAction(result);
			}
		} catch (err) {
			message = err instanceof Error ? err.message : 'Unbekannter Fehler';
		} finally {
			loading = false;
		}
	}
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<div class="card-body space-y-4">
			<h1>Passkey registrieren</h1>

			<form method="POST" class="space-y-2" onsubmit={registerPasskey}>
				<label class="label" for="passkey-name">
					<span class="label-text">Name des Passkeys</span>
				</label>
				<input
					type="text"
					id="passkey-name"
					name="name"
					class="input w-full"
					placeholder="z. B. MacBook Air, Android"
					required
				/>

				<button class="btn btn-primary w-full" type="submit" disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner"></span>
						<span>Registriere…</span>
					{:else}
						Passkey erstellen
					{/if}
				</button>
			</form>

			{#if message}
				<p class="text-error text-center text-sm" aria-live="polite">{message}</p>
			{/if}

			{#if form?.message}
				<p class="text-error text-center text-sm" aria-live="polite">{form.message}</p>
			{/if}

			<div class="divider">Abbrechen?</div>
			<a href="/" class="btn btn-outline w-full">Zurück zur Übersicht</a>
		</div>
	</div>
</main>
