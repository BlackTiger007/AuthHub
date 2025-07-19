import { getSettings } from './utils/db/settings';

export const settings = $state(await getSettings());
