<script lang="ts">
	import { resolve } from '$app/paths';
	import CharacterCard from '#lib/components/CharacterCard.svelte';
	import Reveal from '#lib/components/Reveal.svelte';
	import { charactersByHouse } from '#lib/data';
	import { locale, localized, t } from '#lib/i18n/store';
	import { media } from '#lib/media';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const house = $derived(data.house);
	const members = $derived(charactersByHouse(house.id));
</script>

<svelte:head>
	<title>{localized(house.name, $locale)} — {$t('brand')}</title>
</svelte:head>

<section class="section detail">
	<div class="container">
		<Reveal>
			<a class="back" href={resolve('/maisons')}>← {$t('houses.back')}</a>
			<div class="hero-house" style={`--accent:${house.color}`}>
				<img class="sigil" src={media(house.sigil)} alt="" />
				<div>
					<h1>{localized(house.name, $locale)}</h1>
					<p class="words">« {localized(house.words, $locale)} »</p>
					<dl class="meta">
						<div>
							<dt>{$t('houses.seat')}</dt>
							<dd>{localized(house.seat, $locale)}</dd>
						</div>
						<div>
							<dt>{$t('houses.region')}</dt>
							<dd>{localized(house.region, $locale)}</dd>
						</div>
					</dl>
				</div>
			</div>
		</Reveal>

		<Reveal delay={80}>
			<p class="desc">{localized(house.description, $locale)}</p>
		</Reveal>

		{#if members.length}
			<Reveal delay={120}>
				<h2 class="members-title">{$t('houses.members')}</h2>
			</Reveal>
			<div class="grid">
				{#each members as character, i}
					<Reveal delay={140 + i * 50}>
						<CharacterCard {character} {house} />
					</Reveal>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.back {
		display: inline-block;
		margin-bottom: 1.5rem;
		font-family: var(--font-display);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.hero-house {
		display: grid;
		grid-template-columns: 140px 1fr;
		gap: 1.5rem;
		align-items: center;
		padding: 1.5rem;
		background: var(--bg-card);
		border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--border));
		box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 18%, transparent);
		margin-bottom: 2rem;
	}

	.sigil {
		width: 140px;
		height: 168px;
		object-fit: cover;
		border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: clamp(1.6rem, 3.5vw, 2.4rem);
		color: var(--gold);
	}

	.words {
		margin: 0 0 1.25rem;
		font-style: italic;
		color: var(--accent);
		font-size: 1.1rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin: 0;
	}

	.meta div {
		margin: 0;
	}

	dt {
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.2rem;
	}

	dd {
		margin: 0;
		color: var(--text);
	}

	.desc {
		max-width: 46rem;
		font-size: 1.05rem;
		margin-bottom: 2.5rem;
	}

	.members-title {
		font-size: 1.3rem;
		color: var(--gold);
		margin-bottom: 1.25rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.25rem;
	}

	@media (max-width: 600px) {
		.hero-house {
			grid-template-columns: 1fr;
			justify-items: start;
		}
	}
</style>
