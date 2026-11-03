<script lang="ts">
	import HouseCard from '#lib/components/HouseCard.svelte';
	import Reveal from '#lib/components/Reveal.svelte';
	import { houses } from '#lib/data';
	import { t } from '#lib/i18n/store';
</script>

<svelte:head>
	<title>{$t('houses.title')} — {$t('brand')}</title>
</svelte:head>

<section class="section">
	<div class="container">
		<Reveal>
			<h1 class="section-title">{$t('houses.title')}</h1>
			<p class="section-lead">{$t('houses.lead')}</p>
		</Reveal>
		<div class="grid">
			{#each houses as house, i}
				<Reveal delay={i * 50}>
					<HouseCard {house} />
				</Reveal>
			{/each}
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.25rem;
	}
</style>
