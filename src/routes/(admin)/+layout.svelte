<script lang="ts">
	import Navbar from '$lib/components/navbarAdmin.svelte';

	let { children } = $props();
</script>

<div class="drawer lg:drawer-open">
	<input id="drawer-toggle" type="checkbox" class="drawer-toggle peer" />

	<div class="drawer-content flex flex-col peer-checked:overflow-hidden">
		<!-- Mobile Button -->
		<div class="p-4 lg:hidden">
			<label for="drawer-toggle" class="btn btn-primary">☰ Menü</label>
		</div>

		<!-- Seiteninhalt -->
		<div class="flex min-h-screen flex-col">
			{@render children?.()}
		</div>
	</div>

	<!-- Sidebar -->
	<div class="drawer-side">
		<label for="drawer-toggle" class="drawer-overlay"></label>
		<Navbar />
	</div>
</div>
