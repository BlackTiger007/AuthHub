export enum Role {
	Readonly = 0,
	User = 1000,
	Moderator = 2000,
	Admin = 3000
}

export const RoleLabels: Record<Role, string> = {
	[Role.Readonly]: 'Nur Lesen',
	[Role.User]: 'Benutzer',
	[Role.Moderator]: 'Moderator',
	[Role.Admin]: 'Administrator'
};
