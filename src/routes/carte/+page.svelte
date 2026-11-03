<script lang="ts">
	import MapView from '#lib/components/MapView.svelte';
	import Reveal from '#lib/components/Reveal.svelte';
	import { t } from '#lib/i18n/store';
</script>

<svelte:head>
	<title>{$t('map.title')} — {$t('brand')}</title>
</svelte:head>

<section class="section">
	<div class="container">
		<Reveal>
			<h1 class="section-title">{$t('map.title')}</h1>
			<p class="section-lead">{$t('map.lead')}</p>
		</Reveal>
		<Reveal delay={100}>
			<MapView />
		</Reveal>
	</div>
</section>
