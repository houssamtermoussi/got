<script lang="ts">
	import Hero from '#lib/components/Hero.svelte';
	import CharacterCard from '#lib/components/CharacterCard.svelte';
	import HouseCard from '#lib/components/HouseCard.svelte';
	import Reveal from '#lib/components/Reveal.svelte';
	import { characters, houses, getHouse } from '#lib/data';
	import { t } from '#lib/i18n/store';

	const featuredCharacters = characters.slice(0, 4);
	const featuredHouses = houses.slice(0, 4);
</script>

<svelte:head>
	<title>{$t('brand')}</title>
</svelte:head>

<Hero />

<section class="section">
	<div class="container">
		<Reveal>
			<h2 class="section-title">{$t('home.introTitle')}</h2>
			<p class="section-lead">{$t('home.introText')}</p>
		</Reveal>
	</div>
</section>

<section class="section featured">
	<div class="container">
		<Reveal>
			<div class="head">
				<h2 class="section-title">{$t('home.featuredCharacters')}</h2>
				<a class="more" href="/personnages">{$t('home.viewAll')} →</a>
			</div>
		</Reveal>
		<div class="grid chars">
			{#each featuredCharacters as character, i}
				<Reveal delay={i * 80}>
					<CharacterCard {character} house={getHouse(character.houseId)} />
				</Reveal>
			{/each}
		</div>
	</div>
</section>

<section class="section">
	<div class="container">
		<Reveal>
			<div class="head">
				<h2 class="section-title">{$t('home.featuredHouses')}</h2>
				<a class="more" href="/maisons">{$t('home.viewAll')} →</a>
			</div>
		</Reveal>
		<div class="grid houses">
			{#each featuredHouses as house, i}
				<Reveal delay={i * 80}>
					<HouseCard {house} />
				</Reveal>
			{/each}
		</div>
	</div>
</section>

<style>
	.featured {
		background: linear-gradient(180deg, transparent, rgba(22, 19, 17, 0.65), transparent);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.75rem 1.5rem;
		margin-bottom: 2rem;
	}

	.head .section-title {
		margin: 0;
	}

	.more {
		font-family: var(--font-display);
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.grid {
		display: grid;
		gap: 1.25rem;
	}

	.chars {
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	}

	.houses {
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	}
</style>
