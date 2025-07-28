<main class="text-base-content flex min-h-screen flex-col items-center justify-center p-4">
	<div class="card bg-base-100 w-full max-w-md shadow-xl">
		<div class="card-body space-y-6">
			<h1 class="text-center text-2xl font-semibold">Set up two-factor authentication</h1>
			<p class="text-base-content/70 text-center text-base">
				Choose a method to enhance the security of your account:
			</p>

			<ul class="space-y-3">
				<li>
					<a href="/2fa/totp/setup" class="btn btn-outline btn-block justify-start">
						<!-- <span class="material-symbols-outlined">qr_code</span> -->
						<span class="ml-2">Authenticator app (TOTP)</span>
					</a>
				</li>
				<li>
					<a href="/2fa/passkey/register" class="btn btn-outline btn-block justify-start">
						<!-- <span class="material-symbols-outlined">passkey</span> -->
						<span class="ml-2">Passkey</span>
					</a>
				</li>
				<li>
					<a href="/2fa/security-key/register" class="btn btn-outline btn-block justify-start">
						<!-- <span class="material-symbols-outlined">usb</span> -->
						<span class="ml-2">Security key (WebAuthn)</span>
					</a>
				</li>
			</ul>
		</div>
	</div>
</main>
