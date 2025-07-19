<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import github from '$lib/SVG/github.svg';
	import discord from '$lib/SVG/discord.svg';

	let { form }: { form: ActionData } = $props();
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<form class="card-body space-y-4 pb-0" method="post" action="?/login" use:enhance>
			<!-- Logo -->
			<!-- <div class="flex justify-center">
				<img
					src="/favicon.svg"
					alt="App Logo"
					class="border-base-300 bg-base-200 h-16 w-16 rounded-full border p-1"
				/>
			</div> -->

			<h1 class="text-center text-3xl font-bold">Anmelden</h1>

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

			<div class="m-0">
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

			<div class="flex justify-between text-sm">
				<a href="/forgot-password" class="link link-hover text-primary">Passwort vergessen?</a>
			</div>

			<button type="submit" class="btn btn-neutral mt-2 w-full">Anmelden</button>

			<div class="text-center text-sm">
				<p>
					Noch kein Konto?
					<a href="/register" class="link link-hover text-primary">Registrieren</a>
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
			<a href="/api/auth/discord" class="btn btn-outline flex items-center gap-3">
				<img src={discord} alt="Discord" class="size-6" />
				<span>Mit Discord anmelden</span>
			</a>

			<a href="/api/auth/github" class="btn btn-outline flex items-center gap-3">
				<img src={github} alt="Google" class="size-6" />
				<span>Mit Google anmelden</span>
			</a>
		</div>
	</div>
</main>
