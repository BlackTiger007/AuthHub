<script lang="ts">
	import { enhance } from '$app/forms';

	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<h1>Verify your email address</h1>
		<p>We sent an 8-digit code to {data.email}.</p>

		<form method="post" use:enhance action="?/verify">
			<label for="form-verify.code">Code</label>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				id="form-verify.code"
				name="code"
				autocomplete="one-time-code"
				autofocus
				required
				class="input"
			/>
			<br />
			<button class="btn">Verify</button>
			<p>{form?.verify?.message ?? ''}</p>
		</form>

		<form method="post" use:enhance action="?/resend">
			<button class="btn mt-2">Resend code</button>
			<p>{form?.resend?.message ?? ''}</p>
		</form>

		<a href="/settings" class="link mt-2 block">Change your email</a>
	</div>
</main>
