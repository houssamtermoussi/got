import charactersData from './characters.json';
import episodesData from './episodes.json';
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

export type Episode = {
	season: number;
	number: number;
	title: LocaleText;
	/** Original US air date, ISO `YYYY-MM-DD`. */
	airDate: string;
	/** Minutes. */
	runtime: number;
	/** IMDb user rating out of 10. */
	rating: number;
	votes: number;
	imdbId: string;
};

export type Season = {
	number: number;
	year: number;
	episodes: Episode[];
	averageRating: number;
	topRating: number;
};

export const houses = housesData as House[];
export const characters = charactersData as Character[];
export const locations = locationsData as Location[];
export const episodes = episodesData as Episode[];

/** Day the IMDb ratings and vote counts in `episodes.json` were collected. */
export const episodeRatingsDate = '2026-11-18';

export const seasons: Season[] = [...new Set(episodes.map((e) => e.season))].map((number) => {
	const list = episodes.filter((e) => e.season === number);
	const ratings = list.map((e) => e.rating);
	return {
		number,
		year: Number(list[0].airDate.slice(0, 4)),
		episodes: list,
		averageRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
		topRating: Math.max(...ratings)
	};
});

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
