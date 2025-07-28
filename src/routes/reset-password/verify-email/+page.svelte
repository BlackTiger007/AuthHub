<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<main class="bg-base-200 flex min-h-screen items-center justify-center p-6">
	<div class="card bg-base-100 w-full max-w-md rounded-lg shadow-xl">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">E-Mail-Adresse bestätigen</h1>
			<p class="text-base-content/70 text-center text-sm">
				Wir haben einen 8-stelligen Code an <strong>{data.email}</strong> gesendet.
			</p>

			<form method="post" use:enhance class="flex flex-col gap-4">
				<label for="form-verify-code" class="font-medium">Code</label>
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="number"
					id="form-verify-code"
					name="code"
					inputmode="numeric"
					min="100000"
					max="999999"
					placeholder="8-stelliger Code"
					class="input input-bordered w-full"
					aria-describedby="form-message"
					autocomplete="one-time-code"
					autofocus
					required
				/>

				<button type="submit" class="btn btn-primary w-full">Code bestätigen</button>

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
		</div>
	</div>
</main>
