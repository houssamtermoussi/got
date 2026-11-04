<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { t } from '#lib/i18n/store';
	import IronThrone from './IronThrone.svelte';

	const mapBg = asset('/images/map/realms.svg');

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
				const brand = content.querySelector('.brand');
				const title = content.querySelector('h1');
				const sub = content.querySelector('.sub');
				const actions = content.querySelectorAll('.actions a');
				const lines = [brand, title, sub, ...actions].filter(Boolean);

				gsap.set(lines, {
					opacity: 0,
					x: -48,
					y: 18,
					filter: 'blur(8px)'
				});

				const enter = gsap.timeline({ delay: 0.45, defaults: { ease: 'power3.out' } });
				enter.to(brand, {
					opacity: 1,
					x: 0,
					y: 0,
					filter: 'blur(0px)',
					duration: 1
				});
				enter.to(
					title,
					{
						opacity: 1,
						x: 0,
						y: 0,
						filter: 'blur(0px)',
						duration: 0.85
					},
					'-=0.65'
				);
				enter.to(
					sub,
					{
						opacity: 1,
						x: 0,
						y: 0,
						filter: 'blur(0px)',
						duration: 0.8
					},
					'-=0.55'
				);
				enter.to(
					actions,
					{
						opacity: 1,
						x: 0,
						y: 0,
						filter: 'blur(0px)',
						duration: 0.7,
						stagger: 0.1
					},
					'-=0.45'
				);

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

<section class="hero" bind:this={root} aria-label={$t('hero.title')} style={`--map-bg: url('${mapBg}')`}>
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
			<a class="btn" href={resolve('/personnages')}>{$t('hero.ctaCharacters')}</a>
			<a class="btn btn-ghost" href={resolve('/carte')}>{$t('hero.ctaMap')}</a>
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
		align-items: start;
		overflow: hidden;
		padding: 4.5rem 0 5rem;
	}

	.layer {
		position: absolute;
		inset: -8% 0 0;
		pointer-events: none;
		will-change: transform;
	}

	.bg {
		background:
			radial-gradient(ellipse 55% 45% at 72% 38%, rgba(139, 30, 30, 0.42), transparent 62%),
			radial-gradient(ellipse 40% 35% at 18% 62%, rgba(90, 110, 135, 0.18), transparent 58%),
			radial-gradient(ellipse 45% 30% at 48% 18%, rgba(201, 162, 39, 0.1), transparent 55%),
			linear-gradient(180deg, rgba(8, 7, 6, 0.35) 0%, rgba(7, 6, 5, 0.82) 100%),
			var(--map-bg) center 28% / cover no-repeat;
		filter: saturate(0.55) brightness(0.42) contrast(1.15);
		transform: scale(1.08);
	}

	.fog {
		background:
			linear-gradient(
				180deg,
				rgba(7, 6, 5, 0.15) 0%,
				rgba(7, 6, 5, 0.45) 45%,
				rgba(7, 6, 5, 0.88) 78%,
				var(--bg) 100%
			),
			radial-gradient(ellipse 90% 55% at 50% 100%, rgba(42, 37, 32, 0.85), transparent 65%),
			radial-gradient(ellipse 50% 40% at 80% 30%, rgba(139, 30, 30, 0.18), transparent 60%),
			radial-gradient(ellipse 40% 35% at 15% 55%, rgba(70, 90, 110, 0.14), transparent 55%);
		animation: mist-drift 28s ease-in-out infinite alternate;
	}

	@keyframes mist-drift {
		from {
			opacity: 0.88;
			transform: translate3d(0, 0, 0) scale(1);
		}
		to {
			opacity: 1;
			transform: translate3d(-1.5%, 1.2%, 0) scale(1.04);
		}
	}

	.throne {
		position: absolute;
		z-index: 1;
		right: max(1.25rem, calc((100% - 1120px) / 2));
		bottom: 7.5rem;
		width: min(34vw, 440px, calc((100vh - var(--nav-h) - 6rem) * 0.75));
		aspect-ratio: 900 / 1200;
		pointer-events: none;
		will-change: transform;
	}

	.content {
		position: relative;
		z-index: 2;
		max-width: 40rem;
		width: min(40rem, calc(100% - 2.5rem));
		margin-inline: max(1.25rem, calc((100% - 1120px) / 2)) auto;
		padding-bottom: 1rem;
		will-change: transform, opacity;
		justify-self: start;
	}

	.content :is(.brand, h1, .sub, .actions a) {
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.content :is(.brand, h1, .sub, .actions a) {
			opacity: 1;
		}
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
			width: min(65vw, 340px);
			translate: 50% 0;
			opacity: 0.35;
		}
	}

	@media (max-width: 700px) {
		.hero {
			align-items: start;
			padding-top: 12rem;
		}

		.content {
			justify-self: stretch;
		}
	}
</style>
