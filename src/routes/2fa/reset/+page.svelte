<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<div class="card-body space-y-4">
			<h1 class="mb-4 text-2xl font-semibold">Recover your account</h1>

			<form method="post" use:enhance class="max-w-sm space-y-4">
				<div class="form-control">
					<label for="form-totp.code" class="label">Recovery code</label>
					<input
						type="number"
						id="form-totp.code"
						name="code"
						class="input w-full"
						autocomplete="one-time-code"
						required
					/>
				</div>

				<button class="btn btn-primary w-full" type="submit">Verify</button>

				{#if form?.message}
					<p class="text-error mt-2 text-sm">{form.message}</p>
				{/if}
			</form>
		</div>
	</div>
</main>
