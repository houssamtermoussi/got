import { getHouse, houses } from '#lib/data';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => houses.map((h) => ({ id: h.id }));

export const load: PageLoad = ({ params }) => {
	const house = getHouse(params.id);
	if (!house) error(404, 'House not found');
	return { house };
};
