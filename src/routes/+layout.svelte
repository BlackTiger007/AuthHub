<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="canonical" href="{page.url.origin}{page.url.pathname}" />
</svelte:head>

<div class="bg-base-300 flex min-h-screen flex-col">
	{@render children?.()}
</div>
