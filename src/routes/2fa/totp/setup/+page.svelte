<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<main class="text-base-content flex min-h-screen items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">Set up authenticator app</h1>

			<div class="flex justify-center">
				<div class="h-48 w-48">{@html data.qrcode}</div>
			</div>

			<form method="post" use:enhance class="space-y-4">
				<input type="hidden" name="key" value={data.encodedTOTPKey} required />

				<div class="form-control">
					<label for="code" class="label">Code from authenticator app</label>
					<input
						type="number"
						id="code"
						name="code"
						inputmode="numeric"
						min="100000"
						max="999999"
						autocomplete="one-time-code"
						class="input input-bordered w-full"
						required
					/>
				</div>

				{#if form?.message}
					<p class="text-error text-sm">{form.message}</p>
				{/if}

				<div class="form-control">
					<button type="submit" class="btn btn-primary w-full">Save</button>
				</div>
			</form>
		</div>
	</div>
</main>
