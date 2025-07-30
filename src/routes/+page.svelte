<script lang="ts">
	import { enhance } from '$app/forms';
	import { Role } from '$lib/utils/roles';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<header class="bg-base-100 flex justify-between p-4 shadow-md">
	<nav class="flex gap-4">
		<a href="/" class="link link-primary font-semibold">Home</a>
		<a href="/settings" class="link link-primary font-semibold">Settings</a>
		{#if data.user.role >= Role.Admin}
			<a href="/admin" class="link link-primary font-semibold">Dashbord</a>
		{/if}
	</nav>
</header>

<main>
	<h1>Willkommen bei AuthHub</h1>
	<h2 class="mb-2">Hi {data.user.username}!</h2>
	<p class="mb-4">You are signed in. Use the button below to log out of your session.</p>

	<form method="post" use:enhance>
		<button class="btn">Sign out</button>
	</form>
</main>
