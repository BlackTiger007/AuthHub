<script lang="ts">
	import { enhance } from '$app/forms';
	import Collapse from '$lib/components/collapse.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Status für Feedbacktext
	let copiedTarget: string | null = $state(null);

	function copyToClipboard(url: string, id: string, button: HTMLButtonElement) {
		navigator.clipboard.writeText(url).then(() => {
			copiedTarget = id;
			button.classList.add('bg-success');

			setTimeout(() => {
				copiedTarget = null;
				button.classList.remove('bg-success');
			}, 1000);
		});
	}
</script>

<main class="text-base-content flex grow flex-col items-center space-y-10 p-6">
	<header class="space-y-2 text-center">
		<h1 class="text-3xl font-bold">Integrationen & Dienste</h1>
		<p>Richte Integrationen & Dienste ein, um passwortlose und Social-Anmeldung zu aktivieren</p>
	</header>

	<!-- Authentifizierung -->
	<section class="w-full max-w-5xl space-y-4">
		<h2 class="text-lg font-semibold">🔐 Authentifizierung</h2>
		<div class="flex flex-wrap justify-start gap-4">
			<Collapse title="Discord">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Callback-URL</legend>
					<div class="join">
						<input
							type="text"
							class="input join-item"
							value="{data.url}/api/auth/discord"
							readonly
							disabled
						/>
						<button
							type="button"
							class="btn join-item transition-colors duration-300"
							onclick={(e) =>
								copyToClipboard(
									`${data.url}/api/auth/discord`,
									'discord',
									e.currentTarget as HTMLButtonElement
								)}
						>
							{copiedTarget === 'discord' ? 'Kopiert!' : 'Kopieren'}
						</button>
					</div>
				</fieldset>

				<form action="?/discord" method="post" use:enhance>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Client ID</legend>
						<input
							id="discord-client-id"
							name="clientID"
							type="text"
							class="input"
							value={data.discord.clientID}
							autocomplete="off"
							required
						/>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Client Secret</legend>
						<input
							id="discord-client-secret"
							name="clientSecret"
							type="password"
							class="input"
							value={data.discord.clientSecret}
							autocomplete="off"
							required
						/>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Scope</legend>
						<input
							id="discord-scopes"
							name="scopes"
							type="text"
							class="input"
							value={data.discord.scopes}
						/>
						<p class="label">Optional</p>
					</fieldset>

					{#if form?.form === 'discord'}
						{#if form.success}
							<p class="text-success">{form.message}</p>
						{:else}
							<p class="text-error">{JSON.stringify(form.message, null, 2)}</p>
						{/if}
					{/if}

					<button type="submit" class="btn">Save</button>
				</form>

				<form action="?/deleteDiscord" method="post">
					<button class="btn">Löschen</button>
				</form>
			</Collapse>
			<Collapse title="GitHub">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Callback-URL</legend>
					<div class="join">
						<input
							type="text"
							class="input join-item"
							value="{data.url}/api/auth/github"
							readonly
							disabled
						/>
						<button
							type="button"
							class="btn join-item transition-colors duration-300"
							onclick={(e) =>
								copyToClipboard(
									`${data.url}/api/auth/github`,
									'github',
									e.currentTarget as HTMLButtonElement
								)}
						>
							{copiedTarget === 'github' ? 'Kopiert!' : 'Kopieren'}
						</button>
					</div>
				</fieldset>

				<form action="?/github" method="post" use:enhance>
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Client ID</legend>
						<input
							id="github-client-id"
							name="clientID"
							type="text"
							class="input"
							value={data.github.clientID}
							required
						/>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Client Secret</legend>
						<input
							id="github-client-secret"
							name="clientSecret"
							type="password"
							class="input"
							value={data.github.clientSecret}
							required
						/>
					</fieldset>

					<fieldset class="fieldset">
						<legend class="fieldset-legend">Scope</legend>
						<input
							id="github-scopes"
							name="scopes"
							type="text"
							class="input"
							value={data.github.scopes}
						/>
						<p class="label">Optional</p>
					</fieldset>

					{#if form?.form === 'github'}
						{#if form.success}
							<p class="text-success">{form.message}</p>
						{:else}
							<p class="text-error">{JSON.stringify(form.message, null, 2)}</p>
						{/if}
					{/if}

					<button type="submit" class="btn">Save</button>
				</form>

				<form action="?/deleteGithub" method="post">
					<button class="btn">Löschen</button>
				</form>
			</Collapse>
		</div>
	</section>

	<!-- Benachrichtigungen -->
	<section class="w-full max-w-5xl space-y-4">
		<h2 class="text-lg font-semibold">✉️ Benachrichtigungen</h2>
		<Collapse title="SMTP">
			<form action="?/smtp" method="post" use:enhance>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Host</legend>
					<input
						id="smtp-host"
						name="host"
						type="text"
						class="input"
						value={data.smtp.host}
						required
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Port</legend>
					<input
						id="smtp-port"
						name="port"
						type="number"
						class="input"
						min="0"
						value={data.smtp.port}
						required
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Name</legend>
					<input
						id="smtp-username"
						name="username"
						type="email"
						class="input"
						value={data.smtp.username}
						required
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Password</legend>
					<input
						id="smtp-password"
						name="password"
						type="password"
						class="input"
						value={data.smtp.password}
						required
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">From E-Mail</legend>
					<input
						id="smtp-from"
						name="from"
						type="email"
						class="input"
						value={data.smtp.from}
						required
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">To E-Mail</legend>
					<input id="smtp-to" name="to" type="email" class="input" value={data.smtp.to} />
					<p class="label">Optional</p>
				</fieldset>

				{#if form?.form === 'smtp'}
					{#if form.success}
						<p class="text-success">{form.message}</p>
					{:else}
						<p class="text-error">{JSON.stringify(form.message, null, 2)}</p>
					{/if}
				{/if}

				<button type="submit" class="btn">Save</button>
			</form>

			<form action="?/deleteSmtp" method="post" use:enhance>
				<button class="btn">Löschen</button>
			</form>
			<form action="?/smtpTest" method="post" use:enhance>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Test E-Mail</legend>
					<input id="smtp-test" name="test" type="email" class="input" required />
				</fieldset>

				{#if form?.form === 'smtpTest'}
					{#if form.success}
						<p class="text-success">{form.message}</p>
					{:else}
						<p class="text-error">{JSON.stringify(form.message, null, 2)}</p>
					{/if}
				{/if}

				<button type="submit" class="btn">Senden</button>
			</form>
		</Collapse>
	</section>

	<!-- Sicherheit -->
	<section class="w-full max-w-5xl space-y-4">
		<h2 class="text-lg font-semibold">🛡️ Sicherheit</h2>
		<Collapse title="Passwort-Richtlinien">
			<form action="?/password" method="post" use:enhance>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Passowrd länge</legend>
					<input
						id="password-length"
						name="length"
						type="number"
						class="input"
						min="0"
						value={data.password.length}
						required
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">lowercase</legend>
					<input
						id="password-lowercase"
						name="lowercase"
						type="checkbox"
						checked={data.password.lowercase}
						class="toggle"
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">numbers</legend>
					<input
						id="password-numbers"
						name="numbers"
						type="checkbox"
						checked={data.password.numbers}
						class="toggle"
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">symbols</legend>
					<input
						id="password-symbols"
						name="symbols"
						type="checkbox"
						checked={data.password.symbols}
						class="toggle"
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">uppercase</legend>
					<input
						id="password-uppercase"
						name="uppercase"
						type="checkbox"
						checked={data.password.uppercase}
						class="toggle"
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">exclude</legend>
					<textarea id="password-exclude" name="exclude" class="textarea"
						>{data.password.exclude}</textarea
					>
					<div class="label">Optional</div>
				</fieldset>

				<button type="submit" class="btn">Save</button>
			</form>
		</Collapse>
	</section>
</main>
