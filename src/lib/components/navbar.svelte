<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Role } from '$lib/utils/roles';
</script>

<header class="bg-base-100 flex justify-between p-4 shadow-md">
	<nav class="flex w-full justify-between gap-4">
		<div class="flex items-center gap-4">
			<a href="/" class="link link-primary font-semibold">Home</a>
			<a href="/settings" class="link link-primary font-semibold">Settings</a>
			{#if page.data.user.role >= Role.Admin}
				<a href="/admin" class="link link-primary font-semibold">Dashbord</a>
			{/if}
		</div>
		<div>
			<form method="post" action="?/logout" use:enhance>
				<button class="btn">Sign out</button>
			</form>
		</div>
	</nav>
</header>
