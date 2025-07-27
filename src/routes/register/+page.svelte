<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-2xl">
		<form class="card-body space-y-4" method="post" use:enhance>
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
				<label for="form-signup.username" class="label">
					<span class="label-text">Benutzername</span>
				</label>
				<input
					id="form-signup.username"
					name="username"
					type="text"
					class="input w-full"
					value={form?.username ?? ''}
					minlength="4"
					maxlength="31"
					required
				/>
			</div>

			<div>
				<label for="form-signup.email" class="label">
					<span class="label-text">E-Mail</span>
				</label>
				<input
					type="email"
					id="form-signup.email"
					name="email"
					class="input w-full"
					autocomplete="email"
					value={form?.email ?? ''}
					required
				/>
			</div>

			<div>
				<label for="form-signup.password" class="label">
					<span class="label-text">Passwort</span>
				</label>
				<input
					type="password"
					id="form-signup.password"
					name="password"
					class="input w-full"
					autocomplete="new-password"
					required
				/>
			</div>

			<!-- <div>
				<label for="form-signup.passwordConfirm" class="label">
					<span class="label-text">Passwort wiederholen</span>
				</label>
				<input
					type="password"
					id="form-signup.passwordConfirm"
					name="passwordConfirm"
					class="input   w-full"
					autocomplete="new-password"
					required
				/>
			</div> -->

			<button type="submit" class="btn btn-neutral mt-2 w-full">Registrieren</button>

			{#if form?.message}
				<p class="text-error text-center">{form.message}</p>
			{/if}

			<a href="/login" class="link link-hover text-primary text-center">
				Hast du schon ein Konto? Jetzt Anmelden
			</a>
		</form>
	</div>
</main>
