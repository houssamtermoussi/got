<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '#lib/i18n/store';
	import IronThrone from './IronThrone.svelte';

	let root: HTMLElement | undefined = $state();
	let layerBg: HTMLElement | undefined = $state();
	let layerFog: HTMLElement | undefined = $state();
	let layerThrone: HTMLElement | undefined = $state();
	let layerContent: HTMLElement | undefined = $state();

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || !root || !layerBg || !layerFog || !layerThrone || !layerContent) return;
		const [hero, bg, fog, throne, content] = [root, layerBg, layerFog, layerThrone, layerContent];

		let reverted = false;
		let ctx: { revert: () => void } | undefined;

		void (async () => {
			const gsap = (await import('gsap')).default;
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			if (reverted) return;
			gsap.registerPlugin(ScrollTrigger);

			ctx = gsap.context(() => {
				gsap.to(bg, {
					y: 140,
					scale: 1.12,
					ease: 'none',
					scrollTrigger: {
						trigger: hero,
						start: 'top top',
						end: 'bottom top',
						scrub: true
					}
				});
				gsap.to(fog, {
					y: 80,
					ease: 'none',
					scrollTrigger: {
						trigger: hero,
						start: 'top top',
						end: 'bottom top',
						scrub: true
					}
				});
				gsap.to(throne, {
					y: 90,
					ease: 'none',
					scrollTrigger: {
						trigger: hero,
						start: 'top top',
						end: 'bottom top',
						scrub: true
					}
				});
				gsap.to(content, {
					y: 40,
					opacity: 0.35,
					ease: 'none',
					scrollTrigger: {
						trigger: hero,
						start: 'top top',
						end: 'bottom top',
						scrub: true
					}
				});
			}, hero);
		})();

		return () => {
			reverted = true;
			ctx?.revert();
		};
	});
</script>

<section class="hero" bind:this={root} aria-label={$t('hero.title')}>
	<div class="layer bg" bind:this={layerBg} aria-hidden="true"></div>
	<div class="layer fog" bind:this={layerFog} aria-hidden="true"></div>
	<div class="throne" bind:this={layerThrone}>
		<IronThrone />
	</div>
	<div class="content container" bind:this={layerContent}>
		<p class="brand">{$t('brand')}</p>
		<h1>{$t('hero.title')}</h1>
		<p class="sub">{$t('hero.subtitle')}</p>
		<div class="actions">
			<a class="btn" href="/personnages">{$t('hero.ctaCharacters')}</a>
			<a class="btn btn-ghost" href="/carte">{$t('hero.ctaMap')}</a>
		</div>
	</div>
	<div class="fade" aria-hidden="true"></div>
</section>

<style>
	.hero {
		position: relative;
		isolation: isolate;
		min-height: calc(100vh - var(--nav-h));
		display: grid;
		align-items: end;
		overflow: hidden;
		padding: 0 0 5rem;
	}

	.layer {
		position: absolute;
		inset: -8% 0 0;
		pointer-events: none;
		will-change: transform;
	}

	.bg {
		background:
			radial-gradient(ellipse 70% 50% at 70% 40%, rgba(139, 30, 30, 0.35), transparent 60%),
			radial-gradient(ellipse 50% 40% at 20% 70%, rgba(201, 162, 39, 0.12), transparent 55%),
			linear-gradient(180deg, #14110e 0%, #0b0a09 100%),
			url('/images/map/realms.svg') center 30% / cover no-repeat;
		filter: saturate(0.7) brightness(0.55);
		transform: scale(1.08);
	}

	.fog {
		background:
			linear-gradient(180deg, rgba(11, 10, 9, 0.2), rgba(11, 10, 9, 0.75) 70%, #0b0a09),
			radial-gradient(ellipse at 50% 80%, rgba(42, 37, 32, 0.7), transparent 60%);
	}

	.throne {
		position: absolute;
		z-index: 1;
		right: max(1.25rem, calc((100% - 1120px) / 2));
		bottom: 3.5rem;
		width: min(38vw, 480px, calc((100vh - var(--nav-h) - 6rem) * 0.8));
		aspect-ratio: 4 / 5;
		pointer-events: none;
		will-change: transform;
	}

	.content {
		position: relative;
		z-index: 2;
		max-width: 40rem;
		padding-bottom: 1rem;
		will-change: transform, opacity;
	}

	.brand {
		margin: 0 0 0.75rem;
		font-family: var(--font-display);
		font-size: clamp(1.8rem, 5vw, 3.2rem);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--gold);
		text-shadow: 0 0 40px rgba(201, 162, 39, 0.35);
	}

	h1 {
		margin: 0 0 1rem;
		font-size: clamp(1.2rem, 2.5vw, 1.6rem);
		font-weight: 500;
		letter-spacing: 0.08em;
		color: var(--text);
	}

	.sub {
		margin: 0 0 1.75rem;
		color: var(--muted);
		font-size: 1.02rem;
		max-width: 32rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	.fade {
		position: absolute;
		inset: auto 0 0;
		height: 6rem;
		background: linear-gradient(transparent, var(--bg));
		z-index: 3;
	}

	@media (max-width: 900px) {
		.throne {
			right: 50%;
			bottom: auto;
			top: 1.5rem;
			width: min(80vw, 420px);
			translate: 50% 0;
			opacity: 0.35;
		}
	}

	@media (max-width: 700px) {
		.hero {
			align-items: center;
			padding-top: 3rem;
		}
	}
</style>
