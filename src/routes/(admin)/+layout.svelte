<script lang="ts">
	import Alert from '$lib/components/alert.svelte';
	import Navbar from '$lib/components/navbarAdmin.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
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
			<Alert visible={data.smtp} />
		</div>
	</div>

	<!-- Sidebar -->
	<div class="drawer-side">
		<label for="drawer-toggle" class="drawer-overlay"></label>
		<Navbar />
	</div>
</div>
