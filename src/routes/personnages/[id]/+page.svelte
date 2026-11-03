<script lang="ts">
	import Reveal from '#lib/components/Reveal.svelte';
	import { getHouse } from '#lib/data';
	import { locale, localized, t } from '#lib/i18n/store';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const character = $derived(data.character);
	const house = $derived(getHouse(character.houseId));
</script>

<svelte:head>
	<title>{localized(character.name, $locale)} — {$t('brand')}</title>
</svelte:head>

<section class="section detail">
	<div class="container layout">
		<Reveal>
			<div class="portrait" style={`--accent:${character.accent}`}>
				<img src={character.image} alt={localized(character.name, $locale)} />
			</div>
		</Reveal>
		<Reveal delay={100}>
			<div class="info">
				<a class="back" href="/personnages">← {$t('characters.back')}</a>
				<h1>{localized(character.name, $locale)}</h1>
				{#if house}
					<p class="house">
						{$t('characters.house')}:
						<a href={`/maisons/${house.id}`}>{localized(house.name, $locale)}</a>
					</p>
				{/if}
				<div class="titles">
					<h2>{$t('characters.titles')}</h2>
					<ul>
						{#each $locale === 'fr' ? character.titles.fr : character.titles.en as title}
							<li>{title}</li>
						{/each}
					</ul>
				</div>
				<p class="bio">{localized(character.bio, $locale)}</p>
				{#if house}
					<a class="btn btn-ghost" href={`/maisons/${house.id}`}>
						{$t('characters.relatedHouse')}
					</a>
				{/if}
			</div>
		</Reveal>
	</div>
</section>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(240px, 360px) 1fr;
		gap: 2.5rem;
		align-items: start;
	}

	.portrait {
		border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--border));
		box-shadow: 0 20px 50px color-mix(in srgb, var(--accent) 20%, transparent);
		overflow: hidden;
		background: var(--bg-card);
	}

	.portrait img {
		width: 100%;
		aspect-ratio: 4 / 5;
		object-fit: cover;
	}

	.back {
		display: inline-block;
		margin-bottom: 1rem;
		font-family: var(--font-display);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}

	h1 {
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		color: var(--gold);
		margin-bottom: 0.5rem;
	}

	.house {
		margin: 0 0 1.5rem;
		color: var(--muted);
	}

	.titles h2 {
		font-size: 0.85rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.5rem;
	}

	ul {
		margin: 0 0 1.5rem;
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	li {
		padding: 0.35rem 0.7rem;
		border: 1px solid var(--border);
		font-size: 0.85rem;
		color: var(--text);
		background: rgba(201, 162, 39, 0.06);
	}

	.bio {
		font-size: 1.05rem;
		color: var(--text);
		max-width: 40rem;
		margin-bottom: 1.5rem;
	}

	@media (max-width: 800px) {
		.layout {
			grid-template-columns: 1fr;
		}

		.portrait {
			max-width: 320px;
		}
	}
</style>
