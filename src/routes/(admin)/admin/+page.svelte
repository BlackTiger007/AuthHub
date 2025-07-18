<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main class="bg-base-300 text-base-content flex grow flex-col space-y-6 p-6">
	<h1 class="text-3xl font-bold">Dashboard</h1>
	<p class="text-base-content/70">Verschaffe dir einen Überblick über die Leistung deiner App</p>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- KPI Card -->
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">Gesamtzahl der Benutzer</h2>
				<p class="text-4xl font-bold">{data.totalUsers}</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">
					Neue Benutzer heute
					<span
						class="tooltip tooltip-left ml-1"
						data-tip="Neue Benutzer, die sich heute registriert haben">🛈</span
					>
				</h2>
				<p class="text-4xl font-bold">{data.newUsersToday}</p>
				<p class={data.trendNewToday >= 0 ? 'text-success' : 'text-error'}>
					({data.trendNewToday >= 0 ? '+' : ''}{data.trendNewToday})
				</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">
					Neue Benutzer in den letzten 7 Tagen
					<span class="tooltip tooltip-left ml-1" data-tip="Neue Benutzer in den letzten 7 Tagen"
						>🛈</span
					>
				</h2>
				<p class="text-4xl font-bold">{data.newUsersLast7Days}</p>
				<p class={data.trendLast7Days >= 0 ? 'text-success' : 'text-error'}>
					({data.trendLast7Days >= 0 ? '+' : ''}{data.trendLast7Days})
				</p>
			</div>
		</div>
	</div>

	<!-- Chart Card -->
	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<div class="flex items-center justify-between">
				<h2 class="card-title">Täglich aktive Benutzer</h2>
				<!-- Platz für ein Datumspicker-Component -->
				<input type="date" class="input input-bordered w-48" />
			</div>
			<p class="text-4xl font-bold">{data.dailyActiveUsers}</p>
			<p class={data.trendDailyActive >= 0 ? 'text-success' : 'text-error'}>
				({data.trendDailyActive >= 0 ? '+' : ''}{data.trendDailyActive})
			</p>
			<div
				class="bg-base-200 rounded-box text-base-content/50 mt-4 flex h-40 items-center justify-center"
			>
				Chart Placeholder
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">Wöchentlich aktive Benutzer</h2>
				<p class="text-4xl font-bold">{data.weeklyActiveUsers}</p>
				<p class={data.trendWeeklyActive >= 0 ? 'text-success' : 'text-error'}>
					({data.trendWeeklyActive >= 0 ? '+' : ''}{data.trendWeeklyActive})
				</p>
			</div>
		</div>

		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="card-title">Monatlich aktive Benutzer</h2>
				<p class="text-4xl font-bold">{data.monthlyActiveUsers}</p>
				<p class={data.trendMonthlyActive >= 0 ? 'text-success' : 'text-error'}>
					({data.trendMonthlyActive >= 0 ? '+' : ''}{data.trendMonthlyActive})
				</p>
			</div>
		</div>
	</div>
</main>
