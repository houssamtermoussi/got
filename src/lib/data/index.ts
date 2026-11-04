import charactersData from './characters.json';
import housesData from './houses.json';
import locationsData from './locations.json';

export type LocaleText = { fr: string; en: string };
export type LocaleList = { fr: string[]; en: string[] };

export type House = {
	id: string;
	name: LocaleText;
	words: LocaleText;
	seat: LocaleText;
	region: LocaleText;
	color: string;
	sigil: string;
	description: LocaleText;
};

export type Character = {
	id: string;
	name: LocaleText;
	houseId: string;
	titles: LocaleList;
	image: string;
	accent: string;
	bio: LocaleText;
};

export type Location = {
	id: string;
	name: LocaleText;
	continent: 'westeros' | 'essos';
	region: LocaleText;
	type: LocaleText;
	houseId: string | null;
	x: number;
	y: number;
	description: LocaleText;
	notable: LocaleList;
};

export const houses = housesData as House[];
export const characters = charactersData as Character[];
export const locations = locationsData as Location[];

export function getHouse(id: string): House | undefined {
	return houses.find((h) => h.id === id);
}

export function getCharacter(id: string): Character | undefined {
	return characters.find((c) => c.id === id);
}

export function getLocation(id: string): Location | undefined {
	return locations.find((l) => l.id === id);
}

export function charactersByHouse(houseId: string): Character[] {
	return characters.filter((c) => c.houseId === houseId);
}
