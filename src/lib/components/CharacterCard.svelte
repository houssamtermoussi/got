<script lang="ts">
	import type { Character, House } from '#lib/data';
	import { localized, locale } from '#lib/i18n/store';

	let {
		character,
		house
	}: {
		character: Character;
		house?: House;
	} = $props();
</script>

<a class="card" href={`/personnages/${character.id}`} style={`--accent:${character.accent}`}>
	<div class="media">
		<img src={character.image} alt={localized(character.name, $locale)} loading="lazy" />
		<div class="veil"></div>
	</div>
	<div class="body">
		<h3>{localized(character.name, $locale)}</h3>
		{#if house}
			<p class="meta">{localized(house.name, $locale)}</p>
		{/if}
		<p class="title">{localized(
			{ fr: character.titles.fr[0], en: character.titles.en[0] },
			$locale
		)}</p>
	</div>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		color: inherit;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		transition:
			transform 0.35s var(--ease),
			box-shadow 0.35s var(--ease),
			border-color 0.35s var(--ease);
	}

	.card:hover {
		transform: translateY(-6px);
		border-color: color-mix(in srgb, var(--accent) 60%, var(--gold));
		box-shadow: 0 16px 40px color-mix(in srgb, var(--accent) 28%, transparent);
		color: inherit;
	}

	.media {
		position: relative;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: var(--fog);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.6s var(--ease);
	}

	.card:hover img {
		transform: scale(1.05);
	}

	.veil {
		position: absolute;
		inset: auto 0 0;
		height: 45%;
		background: linear-gradient(transparent, var(--bg-card));
	}

	.body {
		padding: 1rem 1.1rem 1.25rem;
	}

	h3 {
		font-size: 1.05rem;
		margin: 0 0 0.25rem;
		color: var(--text);
	}

	.meta {
		margin: 0;
		color: var(--accent);
		font-size: 0.8rem;
		font-family: var(--font-display);
		letter-spacing: 0.06em;
	}

	.title {
		margin: 0.45rem 0 0;
		color: var(--muted);
		font-size: 0.88rem;
	}
</style>
