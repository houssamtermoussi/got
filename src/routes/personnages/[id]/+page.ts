import { characters, getCharacter } from '#lib/data';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => characters.map((c) => ({ id: c.id }));

export const load: PageLoad = ({ params }) => {
	const character = getCharacter(params.id);
	if (!character) error(404, 'Character not found');
	return { character };
};
