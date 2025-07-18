<script lang="ts">
	import { page } from '$app/state';
</script>

<main class="flex grow items-center justify-center">
	<div class="max-w-md text-center">
		<h1>{page.status}</h1>
		<p class=" py-6 text-xl">{page.error?.message}</p>
		<a href="/" class="btn btn-info">Startseite</a>
	</div>
</main>
