<script lang="ts">
	import { enhance } from '$app/forms';
	import Collapse from '$lib/components/collapse.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

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
		<p>Aktiviere passwortlose Anmeldung oder OAuth-Dienste für dein Konto</p>
	</header>

	<!-- Authentifizierung -->
	<section class="w-full max-w-5xl space-y-4">
		<h2 class="text-lg font-semibold">🔐 Authentifizierung</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Discord -->
			<Collapse title="Discord">
				<form action="?/discord" method="post" use:enhance class="space-y-4">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Callback-URL</legend>
						<div class="join">
							<input
								type="text"
								class="input join-item"
								value={`${data.url}/login/discord/callback`}
								readonly
								disabled
							/>
							<button
								type="button"
								class="btn join-item transition-colors duration-300"
								onclick={(e) =>
									copyToClipboard(
										`${data.url}/login/discord/callback`,
										'discord',
										e.currentTarget as HTMLButtonElement
									)}
							>
								{copiedTarget === 'discord' ? 'Kopiert!' : 'Kopieren'}
							</button>
						</div>
					</fieldset>

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
						<legend class="fieldset-legend">Scopes (optional)</legend>
						<input
							id="discord-scopes"
							name="scopes"
							type="text"
							class="input"
							value={data.discord.scopes}
						/>
					</fieldset>

					{#if form?.form === 'discord'}
						<p class={form.success ? 'text-success' : 'text-error'}>
							{form.success ? form.message : JSON.stringify(form.message, null, 2)}
						</p>
					{/if}

					<div class="flex gap-2">
						<button type="submit" class="btn btn-primary">Speichern</button>
						<button formaction="?/deleteDiscord" formmethod="post" class="btn btn-error">
							Löschen
						</button>
					</div>
				</form>
			</Collapse>

			<!-- GitHub -->
			<Collapse title="GitHub">
				<form action="?/github" method="post" use:enhance class="space-y-4">
					<fieldset class="fieldset">
						<legend class="fieldset-legend">Callback-URL</legend>
						<div class="join">
							<input
								type="text"
								class="input join-item"
								value={`${data.url}/login/github/callback`}
								readonly
								disabled
							/>
							<button
								type="button"
								class="btn join-item transition-colors duration-300"
								onclick={(e) =>
									copyToClipboard(
										`${data.url}/login/github/callback`,
										'github',
										e.currentTarget as HTMLButtonElement
									)}
							>
								{copiedTarget === 'github' ? 'Kopiert!' : 'Kopieren'}
							</button>
						</div>
					</fieldset>

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
						<legend class="fieldset-legend">Scopes (optional)</legend>
						<input
							id="github-scopes"
							name="scopes"
							type="text"
							class="input"
							value={data.github.scopes}
						/>
					</fieldset>

					{#if form?.form === 'github'}
						<p class={form.success ? 'text-success' : 'text-error'}>
							{form.success ? form.message : JSON.stringify(form.message, null, 2)}
						</p>
					{/if}

					<div class="flex gap-2">
						<button type="submit" class="btn btn-primary">Speichern</button>
						<button formaction="?/deleteGithub" formmethod="post" class="btn btn-error">
							Löschen
						</button>
					</div>
				</form>
			</Collapse>
		</div>
	</section>

	<section class="w-full max-w-5xl space-y-4">
		<h2 class="text-lg font-semibold">📨 Benachrichtigungen</h2>
		<Collapse title="📧 SMTP-Konfiguration">
			<form action="?/smtp" method="post" use:enhance class="space-y-4">
				<fieldset class="fieldset">
					<legend class="fieldset-legend">SMTP Host</legend>
					<input
						type="text"
						name="host"
						class="input"
						placeholder="smtp.example.com"
						value={data.smtp.host}
						required
					/>
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Port</legend>
					<input type="number" name="port" class="input" value={data.smtp.port} required />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Benutzer</legend>
					<input
						type="text"
						name="user"
						class="input"
						placeholder="mail@example.com"
						value={data.smtp.user}
						required
					/>
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Passwort</legend>
					<input type="password" name="password" class="input" value={data.smtp.password} />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Absender Name (From)</legend>
					<input type="text" name="from" class="input" placeholder="Name" value={data.smtp.from} />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Antwortadresse (Reply-To)</legend>
					<input type="email" name="replyTo" class="input" value={data.smtp.replyTo} />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">TLS verwenden</legend>
					<input
						type="checkbox"
						name="secure"
						class="checkbox"
						value="off"
						checked={data.smtp.secure}
					/>
					<p>TLS wird bei Port 465 benötigt. Bei Port 587 wird STARTTLS automatisch verwendet.</p>
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">TLS erforderlich</legend>
					<input
						type="checkbox"
						name="requiretls"
						class="checkbox"
						value="on"
						checked={data.smtp.requireTLS ?? true}
					/>
				</fieldset>

				{#if form?.form === 'smtp'}
					<p class={form.success ? 'text-success' : 'text-error'}>
						{form.success ? form.message : JSON.stringify(form.message, null, 2)}
					</p>
				{/if}

				<div class="flex gap-2">
					<button type="submit" class="btn btn-primary">Speichern</button>
					<button formaction="?/deleteSmtp" formmethod="post" class="btn btn-error">
						Löschen
					</button>
				</div>
			</form>

			<form action="?/smtpTest" method="post" use:enhance>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Test E-Mail</legend>
					<input id="smtp-test" name="test" type="email" class="input" required />
				</fieldset>

				{#if form?.form === 'smtpTest'}
					<p class={form.success ? 'text-success' : 'text-error'}>
						{form.success ? form.message : JSON.stringify(form.message, null, 2)}
					</p>
				{/if}

				<button type="submit" class="btn">Test-E-Mail senden</button>
			</form>
		</Collapse>
	</section>

	<!-- Sicherheit -->
	<section class="w-full max-w-5xl space-y-4">
		<h2 class="text-lg font-semibold">🛡️ Sicherheit</h2>

		<Collapse title="Passwort-Richtlinien">
			<form action="?/password" method="post" use:enhance>
				<fieldset class="fieldset">
					<legend class="fieldset-legend">Passwortlänge</legend>
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
					<legend class="fieldset-legend">Kleinbuchstaben erforderlich</legend>
					<input
						id="password-lowercase"
						name="lowercase"
						type="checkbox"
						checked={data.password.lowercase}
						class="toggle"
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Zahlen erforderlich</legend>
					<input
						id="password-numbers"
						name="numbers"
						type="checkbox"
						checked={data.password.numbers}
						class="toggle"
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Sonderzeichen erforderlich</legend>
					<input
						id="password-symbols"
						name="symbols"
						type="checkbox"
						checked={data.password.symbols}
						class="toggle"
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Großbuchstaben erforderlich</legend>
					<input
						id="password-uppercase"
						name="uppercase"
						type="checkbox"
						checked={data.password.uppercase}
						class="toggle"
					/>
				</fieldset>

				<fieldset class="fieldset">
					<legend class="fieldset-legend">Zeichen ausschließen</legend>
					<textarea id="password-exclude" name="exclude" class="textarea"
						>{data.password.exclude}</textarea
					>
					<div class="label">Optional</div>
				</fieldset>

				<button type="submit" class="btn">Speichern</button>
			</form>
		</Collapse>
	</section>
</main>
