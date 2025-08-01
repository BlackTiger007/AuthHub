<script lang="ts">
	import { enhance } from '$app/forms';
	import Navbar from '$lib/components/navbar.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Navbar />

<main>
	<h1>Willkommen bei AuthHub</h1>
	<h2 class="mb-2">Hi {data.user.username}!</h2>
	<p class="mb-4">You are signed in. Use the button below to log out of your session.</p>
</main>
