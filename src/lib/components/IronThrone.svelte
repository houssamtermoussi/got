<script lang="ts">
	import { asset } from '$app/paths';
	import { onMount } from 'svelte';

	const SRC = asset('/images/iron-throne.webp');

	const round = (n: number) => Math.round(n * 10) / 10;

	function rand(seed: number) {
		const x = Math.sin(seed * 12.9898) * 43758.5453;
		return x - Math.floor(x);
	}

	const embers = Array.from({ length: 22 }, (_, i) => ({
		left: round(8 + rand(i + 400) * 84),
		bottom: round(rand(i + 450) * 14),
		size: round(2 + rand(i + 500) * 3.5),
		dx: round((rand(i + 550) - 0.5) * 120),
		delay: round(rand(i + 600) * 8),
		duration: round(5 + rand(i + 650) * 5)
	}));

	let tiltEl: HTMLElement | undefined = $state();
	let imgWrap: HTMLElement | undefined = $state();

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || !tiltEl || !imgWrap) return;
		const [tilt, wrap] = [tiltEl, imgWrap];

		let reverted = false;
		let ctx: { revert: () => void } | undefined;
		let onMove: ((e: PointerEvent) => void) | undefined;

		void (async () => {
			const gsap = (await import('gsap')).default;
			if (reverted) return;

			ctx = gsap.context(() => {
				gsap.from(wrap, {
					y: 80,
					scale: 0.92,
					opacity: 0,
					filter: 'blur(12px) brightness(0.2)',
					duration: 1.8,
					ease: 'power3.out'
				});

				const rotY = gsap.quickTo(tilt, 'rotationY', { duration: 0.9, ease: 'power3' });
				const rotX = gsap.quickTo(tilt, 'rotationX', { duration: 0.9, ease: 'power3' });
				onMove = (e: PointerEvent) => {
					rotY((e.clientX / window.innerWidth - 0.5) * 16);
					rotX(-(e.clientY / window.innerHeight - 0.5) * 8);
				};
				window.addEventListener('pointermove', onMove);
			});
		})();

		return () => {
			reverted = true;
			if (onMove) window.removeEventListener('pointermove', onMove);
			ctx?.revert();
		};
	});
</script>

<div class="stage" aria-hidden="true">
	<div class="glow"></div>
	<div class="tilt" bind:this={tiltEl}>
		<div class="float">
			<div class="image" bind:this={imgWrap} style="--src: url({SRC})">
				<img src={SRC} alt="" width="900" height="1200" decoding="async" />
				<div class="sheen"></div>
			</div>
		</div>
	</div>
	<div class="embers">
		{#each embers as e}
			<span
				style="left: {e.left}%; bottom: {e.bottom}%; width: {e.size}px; height: {e.size}px; --dx: {e.dx}px; animation-delay: {e.delay}s; animation-duration: {e.duration}s"
			></span>
		{/each}
	</div>
</div>

<style>
	.stage {
		position: relative;
		width: 100%;
		height: 100%;
		perspective: 1000px;
	}

	.glow {
		position: absolute;
		inset: -10% -25% 0;
		background:
			radial-gradient(ellipse 45% 40% at 50% 60%, rgba(180, 40, 40, 0.5), transparent 70%),
			radial-gradient(ellipse 60% 55% at 50% 55%, rgba(201, 162, 39, 0.16), transparent 70%);
		filter: blur(10px);
		animation: pulse 4.5s ease-in-out infinite;
	}

	.tilt {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		will-change: transform;
	}

	.float {
		width: 100%;
		height: 100%;
		animation: float 7s ease-in-out infinite;
	}

	.image {
		position: relative;
		width: 100%;
		height: 100%;
		animation: firelight 3.2s ease-in-out infinite;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		filter: drop-shadow(0 25px 45px rgba(0, 0, 0, 0.85))
			drop-shadow(0 0 30px rgba(180, 40, 40, 0.25));
	}

	.sheen {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			115deg,
			transparent 40%,
			rgba(255, 236, 180, 0.55) 50%,
			transparent 60%
		);
		background-size: 300% 100%;
		background-repeat: no-repeat;
		mask: var(--src) center / contain no-repeat;
		-webkit-mask: var(--src) center / contain no-repeat;
		mix-blend-mode: overlay;
		animation: sheen 6s ease-in-out infinite;
	}

	.embers {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.embers span {
		position: absolute;
		border-radius: 50%;
		background: #ffb347;
		box-shadow:
			0 0 6px 2px rgba(255, 122, 26, 0.8),
			0 0 14px rgba(255, 80, 20, 0.5);
		opacity: 0;
		animation-name: rise;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-16px);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.7;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.06);
		}
	}

	@keyframes firelight {
		0%,
		100% {
			filter: brightness(0.95) sepia(0.05);
		}
		30% {
			filter: brightness(1.08) sepia(0.15);
		}
		60% {
			filter: brightness(0.98) sepia(0.08);
		}
	}

	@keyframes sheen {
		0% {
			background-position: 120% 0;
		}
		60%,
		100% {
			background-position: -20% 0;
		}
	}

	@keyframes rise {
		0% {
			opacity: 0;
			transform: translate(0, 0);
		}
		15% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(var(--dx), -55vh);
		}
	}
</style>
