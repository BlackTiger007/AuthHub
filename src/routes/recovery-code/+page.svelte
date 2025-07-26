<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="bg-base-200 flex min-h-screen items-center justify-center p-6">
	<div class="card bg-base-100 w-full max-w-md rounded-lg text-center shadow-lg">
		<div class="card-body space-y-6">
			<h1 class="text-2xl font-semibold">Recovery-Code</h1>

			<p class="text-lg">
				Dein Recovery-Code ist:
				<span class="ml-2 font-mono break-all underline select-all">{data.recoveryCode}</span>
			</p>

			<p class="text-base-content/70 text-base">
				Du kannst diesen Code verwenden, falls du keinen Zugriff mehr auf deine zweiten Faktoren
				hast.
			</p>

			<a href="/" class="btn btn-primary mt-4 w-full"> Weiter </a>
		</div>
	</div>
</main>
