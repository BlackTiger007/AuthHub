<script lang="ts">
	import { enhance } from '$app/forms';
	import { Role, RoleLabels } from '$lib/utils/roles';
	import type { PageProps } from './$types';

	let { form, data }: PageProps = $props();

	const roles = Object.entries(RoleLabels) as unknown as [Role, string][];

	function formatDate(dateString: Date) {
		const date = new Date(dateString);
		return date.toLocaleString('de-DE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<main class="text-base-content flex grow flex-col items-center space-y-8 p-6">
	<div class="flex w-full max-w-5xl items-center justify-between">
		<h1 class="text-3xl font-bold">Benutzerdetails</h1>
		<a href="/admin/users" class="btn btn-sm btn-outline">Zurück zur Übersicht</a>
	</div>

	<!-- Systemdaten -->
	<div class="card bg-base-200 w-full max-w-5xl shadow-lg">
		<div class="card-body space-y-4">
			<h2 class="card-title text-xl">Systemdaten</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<p><strong>ID:</strong> {data.user.id}</p>
				<p><strong>Rolle:</strong> {Role[data.user.role]}</p>
				<p><strong>Erstellt am:</strong> {formatDate(data.user.createdAt)}</p>
				<p><strong>Letzte Änderung:</strong> {formatDate(data.user.updatedAt)}</p>
				<p>
					<strong>Letzter Login:</strong>
					{data.user.lastLogin ? formatDate(data.user.lastLogin) : '-'}
				</p>
				<p>
					<strong>Status:</strong>
					{#if data.user.verified}
						<span class="badge badge-success">Verifiziert</span>
					{:else}
						<span class="badge badge-warning">Nicht verifiziert</span>
					{/if}
				</p>
			</div>
		</div>
	</div>

	<!-- Benutzerdaten -->
	<div class="card bg-base-200 w-full max-w-5xl shadow-lg">
		<div class="card-body space-y-6">
			<h2 class="card-title text-xl">Benutzerdaten bearbeiten</h2>

			<fieldset class="fieldset">
				<label for="email" class="fieldset-legend">E-Mail-Adresse</label>
				<input
					type="email"
					name="email"
					id="email"
					class="input input-bordered"
					value={data.user.email}
					readonly
				/>
			</fieldset>

			<fieldset class="fieldset">
				<label for="username" class="fieldset-legend">Benutzername</label>
				<input
					type="text"
					name="username"
					id="username"
					class="input input-bordered"
					value={data.user.username}
					readonly
				/>
			</fieldset>

			<fieldset class="fieldset">
				<label for="name" class="fieldset-legend">Name</label>
				<input
					type="text"
					name="name"
					id="name"
					class="input input-bordered"
					value={data.user.name ?? ''}
					readonly
				/>
				<p class="label">Optional</p>
			</fieldset>

			<!-- Passwort ändern -->
			<form action="?/password" method="post" use:enhance class="space-y-2">
				<fieldset class="fieldset">
					<label for="newPassword" class="fieldset-legend">Neues Passwort</label>
					<input
						type="password"
						name="newPassword"
						id="newPassword"
						class="input input-bordered"
						required
					/>
				</fieldset>
				<button class="btn btn-warning">Passwort ändern</button>
			</form>

			<!-- Rolle ändern -->
			<form method="post" action="?/role" use:enhance class="space-y-2">
				<label for="role" class="label">Rolle ändern</label>
				<select id="role" name="role" class="select select-bordered w-full">
					{#each roles as [roleValue, roleLabel]}
						{@const numericValue = Number(roleValue)}
						<option value={numericValue} selected={data.user.role === numericValue}>
							{roleLabel}
						</option>
					{/each}
				</select>

				<button class="btn btn-sm btn-primary mt-2" type="submit">Rolle aktualisieren</button>

				{#if form?.form === 'role'}
					{#if form?.success}
						<p class="text-success">Rolle erfolgreich geändert.</p>
					{:else if form?.message}
						<p class="text-error">{form.message}</p>
					{/if}
				{/if}
			</form>

			<!-- Benutzer verifizieren -->
			<form action="?/verify" method="post" use:enhance>
				<button class="btn btn-primary" disabled={data.user.verified}>
					{data.user.verified ? 'Bereits verifiziert' : 'Benutzer verifizieren'}
				</button>
				{#if form?.form === 'verify'}
					{#if form?.success}
						<p class="text-success">Benutzer erfolgreich verifiziert!</p>
					{:else if form.message}
						<p class="text-error">{form.message}</p>
					{/if}
				{/if}
			</form>
		</div>
	</div>

	<!-- Authentifizierungen -->
	<div class="card bg-base-200 w-full max-w-5xl shadow-lg">
		<div class="card-body space-y-4">
			<h2 class="card-title text-xl">Verbundene Authentifizierungen</h2>
			{#if data.user.discordId || data.user.githubId}
				<ul class="list-disc pl-4">
					{#if data.user.discordId}
						<li>Discord</li>
					{/if}
					{#if data.user.githubId}
						<li>GitHub</li>
					{/if}
				</ul>
			{:else}
				<p>Keine verbundenen Authentifizierungen gefunden.</p>
			{/if}
		</div>
	</div>
</main>
