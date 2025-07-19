<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	// Filter und Pagination State
	let filter = $state({
		event: '',
		userId: '',
		ip: '',
		time: ''
	});

	let perPage = $state(20);
	let currentPage = $state(1);

	// Hilfsfunktion: Einzigartige Werte für Filteroptionen
	function uniqueValues<K extends keyof (typeof data.logs)[0]>(key: K) {
		return Array.from(new Set(data.logs.map((item) => item[key]))).filter(
			(v) => v !== undefined && v !== null
		);
	}

	// Gefilterte Logs
	let filteredLogs = $derived(
		data.logs.filter(
			(log) =>
				(!filter.event || log.event === filter.event) &&
				(!filter.userId || log.userId === filter.userId) &&
				(!filter.ip || log.ip === filter.ip) &&
				(!filter.time || formatDate(log.createdAt) === filter.time)
		)
	);

	// Gesamtseitenzahl
	let totalPages = $derived(Math.max(1, Math.ceil(filteredLogs.length / perPage)));

	// Paginierte Logs
	let paginatedLogs = $derived(
		filteredLogs.slice((currentPage - 1) * perPage, currentPage * perPage)
	);

	function goToPage(page: number) {
		currentPage = Math.min(Math.max(1, page), totalPages);
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString();
	}
</script>

<main class="text-base-content flex grow flex-col items-center space-y-10 p-6">
	<h1 class="text-3xl font-bold">Audit Logs</h1>

	<p>Anzeige der Audit-Logs von Authentifizierungs- und Systemereignissen.</p>

	<div class="rounded-box border-base-content/5 bg-base-100 w-5/6 grow overflow-x-auto">
		<form
			class="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
		>
			<select class="select select-sm w-full" bind:value={filter.event}>
				<option value="">Event</option>
				{#each uniqueValues('event') as value}
					<option {value}>{value}</option>
				{/each}
			</select>

			<select class="select select-sm w-full" bind:value={filter.userId}>
				<option value="">User ID</option>
				{#each uniqueValues('userId') as value}
					<option {value}>{value}</option>
				{/each}
			</select>

			<select class="select select-sm w-full" bind:value={filter.ip}>
				<option value="">IP-Adresse</option>
				{#each uniqueValues('ip') as value}
					<option {value}>{value}</option>
				{/each}
			</select>

			<select class="select select-sm w-full" bind:value={filter.time}>
				<option value="">Datum</option>
				{#each uniqueValues('createdAt')
					.map(formatDate)
					.filter((v, i, a) => a.indexOf(v) === i) as value}
					<option {value}>{value}</option>
				{/each}
			</select>

			<button
				type="button"
				class="btn btn-sm col-span-full sm:col-span-2 md:col-span-1"
				onclick={() => {
					filter = { event: '', userId: '', ip: '', time: '' };
					currentPage = 1;
				}}
			>
				Reset
			</button>
		</form>

		<hr class="border-base-content/5" />

		<div class="overflow-x-auto">
			<table class="table-sm table">
				<thead>
					<tr>
						<th>Event</th>
						<th>User ID</th>
						<th>IP</th>
						<th>Datum</th>
					</tr>
				</thead>
				<tbody>
					{#if paginatedLogs.length > 0}
						{#each paginatedLogs as log (log.id)}
							<tr class="hover:bg-base-300" onclick={() => goto(`/admin/audit-logs/${log.id}`)}>
								<td>{log.event}</td>
								<td>{log.userId ?? '-'}</td>
								<td>{log.ip ?? '-'}</td>
								<td>{formatDate(log.createdAt)}</td>
							</tr>
						{/each}
					{:else}
						<tr><td colspan="4" class="text-center">Keine Einträge gefunden.</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<div class="mt-4 flex flex-wrap items-center justify-center gap-3">
		<!-- Pagination -->
		<button
			class="btn btn-sm"
			onclick={() => goToPage(currentPage - 1)}
			disabled={currentPage === 1}
		>
			«
		</button>
		<p class="text-sm">Seite {currentPage} von {totalPages}</p>
		<button
			class="btn btn-sm"
			onclick={() => goToPage(currentPage + 1)}
			disabled={currentPage === totalPages}
		>
			»
		</button>

		<!-- Einträge pro Seite -->
		<div class="flex items-center gap-2">
			<p class="text-sm">Pro Seite:</p>
			<select class="select select-sm" bind:value={perPage} onchange={() => (currentPage = 1)}>
				<option value={20}>20</option>
				<option value={40}>40</option>
				<option value={60}>60</option>
				<option value={80}>80</option>
				<option value={100}>100</option>
			</select>
		</div>
	</div>
</main>
