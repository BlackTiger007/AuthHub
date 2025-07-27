<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<main class="bg-base-200 flex min-h-screen items-center justify-center p-6">
	<div class="card bg-base-100 w-full max-w-md rounded-lg shadow-xl">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">Mit Authenticator-App anmelden</h1>
			<p class="text-base-content/70 text-center text-sm">Geben Sie den Code aus Ihrer App ein.</p>

			<form method="post" use:enhance class="flex flex-col gap-4" novalidate>
				<label for="form-totp-code" class="font-medium"> Code </label>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="number"
					id="form-totp-code"
					name="code"
					inputmode="numeric"
					autocomplete="one-time-code"
					placeholder="000000"
					class="input input-bordered w-full"
					aria-describedby="form-message"
					min="100000"
					max="999999"
					autofocus
					required
				/>

				<button type="submit" class="btn btn-primary w-full"> Bestätigen </button>

				{#if form?.message}
					<p
						id="form-message"
						class="text-error text-center font-medium"
						role="alert"
						aria-live="polite"
					>
						{form.message}
					</p>
				{/if}
			</form>

			<div class="divider" aria-hidden="true">oder</div>

			<a href="/reset-password/2fa/recovery-code" class="btn btn-outline w-full">
				Recovery Code verwenden
			</a>

			{#if data.user.registeredSecurityKey}
				<a href="/reset-password/2fa/security-key" class="btn btn-outline w-full">
					Sicherheitsschlüssel verwenden
				</a>
			{/if}

			{#if data.user.registeredPasskey}
				<a href="/reset-password/2fa/passkey" class="btn btn-outline w-full"> Passkey verwenden </a>
			{/if}
		</div>
	</div>
</main>
