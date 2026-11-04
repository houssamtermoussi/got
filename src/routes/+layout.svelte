<script lang="ts">
	import '#lib/styles/global.css';
	import favicon from '#lib/assets/favicon.png';
	import Nav from '#lib/components/Nav.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap"
		rel="stylesheet"
	/>
	<meta name="description" content="Game of Thrones — personnages, maisons et carte de Westeros et Essos" />
</svelte:head>

<Nav />
<main>
	{@render children()}
</main>
<Footer />
