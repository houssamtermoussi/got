<script lang="ts">
	import CharacterCard from '#lib/components/CharacterCard.svelte';
	import Reveal from '#lib/components/Reveal.svelte';
	import { characters, getHouse } from '#lib/data';
	import { t } from '#lib/i18n/store';
</script>

<svelte:head>
	<title>{$t('characters.title')} — {$t('brand')}</title>
</svelte:head>

<section class="section">
	<div class="container">
		<Reveal>
			<h1 class="section-title">{$t('characters.title')}</h1>
			<p class="section-lead">{$t('characters.lead')}</p>
		</Reveal>
		<div class="grid">
			{#each characters as character, i}
				<Reveal delay={i * 50}>
					<CharacterCard {character} house={getHouse(character.houseId)} />
				</Reveal>
			{/each}
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1.25rem;
	}
</style>
