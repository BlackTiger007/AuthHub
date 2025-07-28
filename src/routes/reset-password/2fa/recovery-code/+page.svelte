<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<main class="bg-base-200 flex min-h-screen items-center justify-center p-6">
	<div class="card bg-base-100 w-full max-w-md rounded-lg shadow-xl">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">Recovery Code verwenden</h1>

			<form method="post" use:enhance class="flex flex-col gap-4">
				<label for="form-recovery-code-code" class="font-medium">Recovery Code</label>
				<input
					type="text"
					name="code"
					id="form-recovery-code-code"
					class="input input-bordered w-full"
					autocomplete="one-time-code"
					aria-describedby="form-message"
					required
				/>

				<button type="submit" class="btn btn-primary w-full">Verifizieren</button>

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
