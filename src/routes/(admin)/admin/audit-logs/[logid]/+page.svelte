<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="text-base-content flex grow flex-col items-center space-y-8 p-6">
	<div class="flex w-full max-w-5xl items-center justify-between">
		<h1 class="text-3xl font-bold">Audit Log Detail</h1>
		<button class="btn btn-sm btn-outline" onclick={() => goto('/admin/audit-logs')}>Zurück</button>
	</div>

	<div class="card bg-base-200 w-full max-w-5xl shadow-lg">
		<div class="card-body space-y-4">
			<h2 class="card-title text-xl">Log Informationen</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<p><strong>Event:</strong> {data.log.event}</p>
				<p>
					<strong>Benutzer:</strong>
					{#if data.user}
						<a class="link link-primary font-medium" href={`/admin/users/${data.user.id}`}>
							{data.user.email}
						</a>
					{:else if data.user !== null}
						<span class="text-error italic">Gelöscht</span>
					{:else}
						<span class="italic">–</span>
					{/if}
				</p>
				<p><strong>IP-Adresse:</strong> {data.log.ip ?? '–'}</p>
				<p><strong>Referer:</strong> {data.log.referer ?? '–'}</p>
				<p><strong>Log-ID:</strong> {data.log.id}</p>
				<p><strong>Zeit:</strong> {new Date(data.log.createdAt).toLocaleString()}</p>
				<p class="col-span-2"><strong>User-Agent:</strong> {data.log.userAgent ?? '–'}</p>
			</div>
		</div>
	</div>

	<div class="card bg-base-200 w-full max-w-5xl shadow-lg">
		<div class="card-body">
			<h2 class="card-title text-xl">Event-Daten</h2>
			<pre class="break-words whitespace-pre-wrap">{JSON.stringify(data.log.data, null, 2)}</pre>
		</div>
	</div>
</main>
