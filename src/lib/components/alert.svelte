<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import warning from '$lib/SVG/warning.svg';

	// Wird z.B. vom Server oder Load-Funktion gesetzt:
	export let visible = false;

	const link = '/admin/integrations';
	const message =
		'SMTP-Konfiguration fehlt! Ohne diese Funktion können keine E-Mails gesendet werden.';
	const linkText = 'Jetzt konfigurieren';
</script>

{#if visible}
	<div class="toast z-50 box-border grid max-h-[33vh] w-fit max-w-2/3 flex-col flex-wrap gap-3 p-3">
		<div
			role="alert"
			class="alert alert-warning shadow-lg"
			in:fly={{ duration: 400, y: -50, easing: cubicOut }}
			out:fly={{ duration: 400, y: 100, easing: cubicIn }}
		>
			<img src={warning} alt="Warning Icon" class="size-6 flex-shrink-0" />
			<span class="font-medium">{message}</span>
			<a href={link} class="btn btn-sm hover:btn-success">
				{linkText}
			</a>
			<button class="btn btn-sm hover:btn-error" onclick={() => (visible = false)}>
				Schließen
			</button>
		</div>
	</div>
{/if}
