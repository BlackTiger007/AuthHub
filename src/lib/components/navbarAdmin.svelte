<script lang="ts">
	import { page } from '$app/state';

	/**
	 * Prüft, ob der Navigationspunkt aktiv ist, also ob der aktuelle Pfad genau übereinstimmt
	 * oder ob es sich um einen Unterpfad handelt (z. B. /admin/users/123).
	 */
	function isActive(path: string): boolean {
		const current = page.url.pathname + '/';
		return current === path || current.startsWith(path + '/');
	}

	const navItems = [
		{
			title: 'Übersicht',
			items: [{ label: 'Dashboard', href: '/admin/' }]
		},
		{
			title: 'Authentifizierung',
			items: [
				{ label: 'Anwendungen', href: '/admin/applications' },
				{ label: 'Integrationen & Dienste', href: '/admin/integrations' }
			]
		},
		{
			title: 'Benutzer',
			items: [{ label: 'Benutzerverwaltung', href: '/admin/users' }]
		},
		{
			title: 'Entwickler',
			items: [{ label: 'Audit logs', href: '/admin/audit-logs' }]
		}
	];
</script>

<nav class="menu bg-base-300 rounded-box sticky top-0 h-screen w-64 rounded-none p-4">
	<ul class="space-y-1 overflow-auto">
		<li class="menu-title text-base-content text-2xl">Admin Dashbord</li>

		{#each navItems as section}
			<li class="menu-title">{section.title}</li>
			{#each section.items as item}
				<li>
					<a href={item.href} class:bg-base-200={isActive(item.href)}>
						{item.label}
					</a>
				</li>
			{/each}
		{/each}

		<li class="my-3"></li>

		<li>
			<a href="/settings">Einstellungen</a>
		</li>

		<li>
			<form action="/admin/?/logout" method="post" class="hover:bg-error">
				<button>Abmelden</button>
			</form>
		</li>
	</ul>
</nav>
