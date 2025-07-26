<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<main class="bg-base-200 flex min-h-screen items-center justify-center p-6">
	<div class="card bg-base-100 w-full max-w-md rounded-lg shadow-lg">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">Passwort vergessen?</h1>

			<form method="post" use:enhance class="flex flex-col gap-4" novalidate>
				<label for="form-forgot-email" class="font-medium">E-Mail</label>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="email"
					id="form-forgot-email"
					name="email"
					class="input input-bordered w-full"
					autocomplete="email"
					value={form?.email ?? ''}
					aria-describedby="form-message"
					placeholder="deine@email.de"
					autofocus
					required
				/>

				<button type="submit" class="btn btn-primary w-full">Senden</button>

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

			<a href="/login" class="link link-primary mt-4 block text-center">Anmelden</a>
		</div>
	</div>
</main>
