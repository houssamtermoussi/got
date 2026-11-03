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
				const brand = content.querySelector('.brand');
				const title = content.querySelector('h1');
				const sub = content.querySelector('.sub');
				const actions = content.querySelectorAll('.actions a');
				const lines = [brand, title, sub, ...actions].filter(Boolean);

				gsap.set(content, { transformOrigin: '50% 55%' });
				gsap.set(lines, {
					opacity: 0,
					y: -120,
					scale: 1.35,
					filter: 'blur(14px)',
					transformOrigin: '50% 100%'
				});

				const enter = gsap.timeline({ delay: 0.7, defaults: { ease: 'power3.inOut' } });
				enter.to(brand, {
					opacity: 1,
					y: 0,
					scale: 1,
					filter: 'blur(0px)',
					duration: 1.25,
					ease: 'power3.out'
				});
				enter.to(
					title,
					{
						opacity: 1,
						y: 0,
						scale: 1,
						filter: 'blur(0px)',
						duration: 1,
						ease: 'power3.out'
					},
					'-=0.85'
				);
				enter.to(
					sub,
					{
						opacity: 1,
						y: 0,
						scale: 1,
						filter: 'blur(0px)',
						duration: 0.9,
						ease: 'power3.out'
					},
					'-=0.65'
				);
				enter.to(
					actions,
					{
						opacity: 1,
						y: 0,
						scale: 1,
						filter: 'blur(0px)',
						duration: 0.75,
						stagger: 0.1,
						ease: 'power3.out'
					},
					'-=0.5'
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

<section class="hero" bind:this={root} aria-label={$t('hero.title')}>
	<div class="layer bg" bind:this={layerBg} aria-hidden="true"></div>
	<div class="layer fog" bind:this={layerFog} aria-hidden="true"></div>

	<div class="stage">
		<div class="throne" bind:this={layerThrone}>
			<IronThrone />
		</div>
		<div class="content" bind:this={layerContent}>
			<p class="brand">{$t('brand')}</p>
			<h1>{$t('hero.title')}</h1>
			<p class="sub">{$t('hero.subtitle')}</p>
			<div class="actions">
				<a class="btn" href="/personnages">{$t('hero.ctaCharacters')}</a>
				<a class="btn btn-ghost" href="/carte">{$t('hero.ctaMap')}</a>
			</div>
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
		place-items: center;
		overflow: hidden;
		padding: 1.5rem 0 4rem;
	}

	.layer {
		position: absolute;
		inset: -8% 0 0;
		pointer-events: none;
		will-change: transform;
	}

	.bg {
		background:
			radial-gradient(ellipse 70% 50% at 50% 45%, rgba(139, 30, 30, 0.35), transparent 60%),
			radial-gradient(ellipse 50% 40% at 50% 70%, rgba(201, 162, 39, 0.12), transparent 55%),
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

	.stage {
		position: relative;
		z-index: 2;
		width: min(520px, calc(100% - 2rem));
		aspect-ratio: 900 / 1392;
		max-height: calc(100vh - var(--nav-h) - 3rem);
	}

	.throne {
		position: absolute;
		inset: 0;
		pointer-events: none;
		will-change: transform;
	}

	.content {
		position: absolute;
		left: 50%;
		top: 63%;
		z-index: 2;
		width: min(100%, 26rem);
		translate: -50% -50%;
		text-align: center;
		padding: 1.4rem 1.1rem 1.6rem;
		will-change: transform, opacity;
		background: radial-gradient(
			ellipse 70% 60% at 50% 50%,
			rgba(11, 10, 9, 0.72) 0%,
			rgba(11, 10, 9, 0.28) 55%,
			transparent 75%
		);
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
		margin: 0 0 0.55rem;
		font-family: var(--font-display);
		font-size: clamp(1.45rem, 4.2vw, 2.55rem);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		text-shadow:
			0 2px 18px rgba(0, 0, 0, 0.95),
			0 0 40px rgba(201, 162, 39, 0.4);
	}

	h1 {
		margin: 0 0 0.7rem;
		font-size: clamp(1.05rem, 2.2vw, 1.35rem);
		font-weight: 500;
		letter-spacing: 0.08em;
		color: var(--text);
		text-shadow: 0 2px 14px rgba(0, 0, 0, 0.9);
	}

	.sub {
		margin: 0 auto 1.25rem;
		color: var(--muted);
		font-size: clamp(0.88rem, 1.6vw, 1rem);
		max-width: 22rem;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
	}

	.fade {
		position: absolute;
		inset: auto 0 0;
		height: 6rem;
		background: linear-gradient(transparent, var(--bg));
		z-index: 3;
	}

	@media (max-width: 700px) {
		.stage {
			width: min(380px, calc(100% - 1.5rem));
		}

		.content {
			top: 62%;
			width: min(100%, 20rem);
		}
	}
</style>
