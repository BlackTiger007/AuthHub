<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<form class="card-body space-y-4 pb-0" method="post" action="?/register" use:enhance>
			<!-- Logo -->
			<!-- <div class="flex justify-center">
				<img
					src="/favicon.svg"
					alt="App Logo"
					class="border-base-300 bg-base-200 h-16 w-16 rounded-full border p-1"
				/>
			</div> -->

			<h1 class="text-center text-3xl font-bold">Registrieren</h1>

			<div>
				<label for="username" class="label">
					<span class="label-text">Benutzername</span>
				</label>
				<input
					id="username"
					name="username"
					type="text"
					class="input input-bordered w-full"
					value="Test"
					required
				/>
			</div>

			<div>
				<label for="email" class="label">
					<span class="label-text">E-Mail</span>
				</label>
				<input
					id="email"
					name="email"
					type="email"
					class="input input-bordered w-full"
					value="test@test.mail"
					required
				/>
			</div>

			<div>
				<label for="password" class="label">
					<span class="label-text">Passwort</span>
				</label>
				<input
					id="password"
					name="password"
					type="password"
					class="input input-bordered w-full"
					value="kvyqq6w0bi4yuvsfoz5ho"
					required
				/>
			</div>

			<div>
				<label for="confirmPassword" class="label">
					<span class="label-text">Passwort wiederholen</span>
				</label>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					class="input input-bordered w-full"
					value="kvyqq6w0bi4yuvsfoz5ho"
					required
				/>
			</div>

			<button type="submit" class="btn btn-neutral mt-2 w-full">Registrieren</button>

			<div class="text-center text-sm">
				<p>
					Hast du schon ein Konto?
					<a href="/login" class="link link-hover text-primary">Anmelden</a>
				</p>
			</div>
		</form>

		{#if form?.message}
			<p class="text-error text-center">{form.message}</p>
		{/if}

		<!-- Divider -->
		<div class="divider">oder</div>

		<!-- Alternative Auth -->
		<div class="flex flex-col gap-2 px-6 pb-6">
			<button type="button" class="btn btn-outline flex items-center gap-3">
				<!-- <img src="/icons/discord.svg" alt="Discord" class="h-5 w-5" /> -->
				<span>Mit Discord anmelden</span>
			</button>

			<button type="button" class="btn btn-outline flex items-center gap-3">
				<!-- <img src="/icons/google.svg" alt="Google" class="h-5 w-5" /> -->
				<span>Mit Google anmelden</span>
			</button>
		</div>
	</div>
</main>
