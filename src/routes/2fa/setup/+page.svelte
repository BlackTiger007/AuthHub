<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-xl">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">Set up two-factor authentication</h1>
			<p class="text-base-content/70 text-center text-base">
				Choose a method to enhance the security of your account:
			</p>

			<ul class="space-y-3">
				{#if !data.registeredTOTP}
					<li>
						<a href="/2fa/totp/setup" class="btn btn-outline btn-block justify-start">
							<!-- <span class="material-symbols-outlined">qr_code</span> -->
							<span class="ml-2">Authenticator app (TOTP)</span>
						</a>
					</li>
				{/if}
				{#if !data.registeredPasskey}
					<li>
						<a href="/2fa/passkey/register" class="btn btn-outline btn-block justify-start">
							<!-- <span class="material-symbols-outlined">passkey</span> -->
							<span class="ml-2">Passkey</span>
						</a>
					</li>
				{/if}
				{#if !data.registeredSecurityKey}
					<li>
						<a href="/2fa/security-key/register" class="btn btn-outline btn-block justify-start">
							<!-- <span class="material-symbols-outlined">usb</span> -->
							<span class="ml-2">Security key (WebAuthn)</span>
						</a>
					</li>
				{/if}
			</ul>

			<p class="text-base-content/70 text-center text-sm">You can always add more methods later.</p>

			{#if data.registered2FA}
				<a href="/" class="btn btn-outline btn-block justify-start">
					<span class="ml-2">Zurück</span>
				</a>
			{/if}
		</div>
	</div>
</main>
