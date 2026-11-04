import { asset } from '$app/paths';
import type { AssetPath } from '$app/types';

/** Resolve a path from `static/` (often coming from JSON) with the app base. */
export function media(path: string): string {
	return asset(path as AssetPath);
}
