<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<div class="card-body space-y-4">
			<h1>Authenticate with authenticator app</h1>

			<p class="text-sm">Enter the code from your app.</p>

			<form method="post" use:enhance class="space-y-4">
				<div class="form-control">
					<label for="form-totp.code" class="label">
						<span class="label-text">Code</span>
					</label>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						type="number"
						id="form-totp.code"
						name="code"
						autocomplete="one-time-code"
						class="input w-full"
						inputmode="numeric"
						min="100000"
						max="999999"
						autofocus
						required
					/>
				</div>

				<button type="submit" class="btn btn-primary w-full">Verify</button>

				{#if form?.message}
					<p class="text-error text-sm">{form.message}</p>
				{/if}
			</form>

			<div class="divider">or</div>

			<a href="/2fa/reset" class="link">Use recovery code</a>

			{#if data.user.registeredPasskey}
				<a href="/2fa/passkey" class="link">Use passkeys</a>
			{/if}
			{#if data.user.registeredSecurityKey}
				<a href="/2fa/security-key" class="link">Use security keys</a>
			{/if}
		</div>
	</div>
</main>
