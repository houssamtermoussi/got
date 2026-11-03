import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import en from './en.json';
import fr from './fr.json';

export type Locale = 'fr' | 'en';

const dictionaries = { fr, en } as const;

function getInitialLocale(): Locale {
	if (!browser) return 'fr';
	const saved = localStorage.getItem('got-locale');
	if (saved === 'fr' || saved === 'en') return saved;
	return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export const locale = writable<Locale>(getInitialLocale());

if (browser) {
	locale.subscribe((value) => {
		localStorage.setItem('got-locale', value);
		document.documentElement.lang = value;
	});
}

type Dict = typeof fr;
type NestedKey<T, P extends string = ''> = T extends object
	? {
			[K in keyof T & string]: T[K] extends object
				? NestedKey<T[K], P extends '' ? K : `${P}.${K}`>
				: P extends ''
					? K
					: `${P}.${K}`;
		}[keyof T & string]
	: never;

export type TranslationKey = NestedKey<Dict>;

function resolve(obj: Record<string, unknown>, path: string): string {
	const parts = path.split('.');
	let current: unknown = obj;
	for (const part of parts) {
		if (current && typeof current === 'object' && part in current) {
			current = (current as Record<string, unknown>)[part];
		} else {
			return path;
		}
	}
	return typeof current === 'string' ? current : path;
}

export const t = derived(locale, ($locale) => {
	const dict = dictionaries[$locale] as Record<string, unknown>;
	return (key: TranslationKey | string) => resolve(dict, key);
});

export function setLocale(next: Locale) {
	locale.set(next);
}

export function localized(
	item: { fr: string; en: string },
	$locale: Locale
): string {
	return item[$locale] ?? item.fr;
}
