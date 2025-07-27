<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<header class="mb-4 space-x-4">
	<a href="/" class="link">Home</a>
	<a href="/settings" class="link">Settings</a>
</header>

<main>
	<h1>Willkommen bei AuthHub</h1>
	<h2 class="mb-2">Hi {data.user.username}!</h2>
	<p class="mb-4">You are signed in. Use the button below to log out of your session.</p>

	<form method="post" use:enhance>
		<button class="btn">Sign out</button>
	</form>
</main>
