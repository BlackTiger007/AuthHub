<script lang="ts">
	import { goto } from '$app/navigation';
	import { Role, RoleLabels } from '$lib/utils/roles';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let filter = $state({
		username: '',
		role: null,
		application: '',
		lastLogin: ''
	});

	let perPage = $state(20);
	let currentPage = $state(1);

	function uniqueValues<K extends keyof (typeof data.users)[0]>(key: K) {
		return Array.from(new Set(data.users.map((item) => item[key]))).filter(
			(v) => v !== undefined && v !== null
		);
	}

	function formatDate(date: Date | null) {
		return date ? new Date(date).toLocaleDateString() : '-';
	}

	let filteredUsers = $derived(
		data.users.filter(
			(user) =>
				(!filter.username || user.username === filter.username) &&
				(!filter.role || user.role === filter.role) &&
				(!filter.lastLogin || (user.lastLogin && formatDate(user.lastLogin) === filter.lastLogin))
		)
	);

	let totalPages = $derived(Math.max(1, Math.ceil(filteredUsers.length / perPage)));

	let paginatedUsers = $derived(
		filteredUsers.slice((currentPage - 1) * perPage, currentPage * perPage)
	);

	function goToPage(page: number) {
		currentPage = Math.min(Math.max(1, page), totalPages);
	}
</script>

<main class="bg-base-300 text-base-content flex grow flex-col items-center space-y-10 p-6">
	<h1 class="text-3xl font-bold">Benutzerverwaltung</h1>

	<p>Verwalten von Benutzeridentitäten inkl. Logs und Aktionen.</p>

	<div class="rounded-box border-base-content/5 bg-base-100 w-5/6 grow overflow-x-auto">
		<form
			class="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
		>
			<select class="select select-sm w-full" bind:value={filter.username}>
				<option value="">Benutzer</option>
				{#each uniqueValues('username') as value}
					<option {value}>{value}</option>
				{/each}
			</select>

			<select class="select select-sm w-full" bind:value={filter.role}>
				<option value={null}>Rolle</option>
				{#each uniqueValues('role') as value}
					<option {value}>{RoleLabels[value]}</option>
				{/each}
			</select>

			<select class="select select-sm w-full" bind:value={filter.lastLogin}>
				<option value="">Letzte Anmeldung</option>
				{#each uniqueValues('lastLogin')
					.map(formatDate)
					.filter((v, i, a) => a.indexOf(v) === i) as value}
					<option {value}>{value}</option>
				{/each}
			</select>

			<button
				type="button"
				class="btn btn-sm col-span-full sm:col-span-2 md:col-span-1"
				onclick={() => {
					filter = { username: '', application: '', lastLogin: '', role: null };
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
						<th>Benutzer</th>
						<th>Rolle</th>
						<th>Letzte Anmeldung</th>
					</tr>
				</thead>
				<tbody>
					{#if paginatedUsers.length > 0}
						{#each paginatedUsers as user (user.id)}
							<tr class="hover:bg-base-300" onclick={() => goto(`/admin/users/${user.id}`)}>
								<td>{user.username}</td>
								<td>{RoleLabels[user.role]}</td>
								<td>{formatDate(user.lastLogin)}</td>
							</tr>
						{/each}
					{:else}
						<tr><td colspan="2" class="text-center">Keine Benutzer gefunden.</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<div class="mt-4 flex flex-wrap items-center justify-center gap-3">
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
