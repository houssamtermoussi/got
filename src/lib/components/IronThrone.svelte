<script lang="ts">
	import { onMount } from 'svelte';

	type Sword = {
		blade: string;
		guard: string;
		grip: string;
		origin: string;
	};

	const PIVOT_X = 200;
	const PIVOT_Y = 340;

	const round = (n: number) => Math.round(n * 10) / 10;

	function rand(seed: number) {
		const x = Math.sin(seed * 12.9898) * 43758.5453;
		return x - Math.floor(x);
	}

	function shape(points: [number, number][], angle: number, ox: number, oy: number) {
		const a = (angle * Math.PI) / 180;
		const c = Math.cos(a);
		const s = Math.sin(a);
		return (
			'M' +
			points.map(([x, y]) => `${round(ox + x * c - y * s)},${round(oy + x * s + y * c)}`).join(' L') +
			' Z'
		);
	}

	function sword(angle: number, len: number, w: number, offset: number, px: number, py: number): Sword {
		const a = (angle * Math.PI) / 180;
		const ox = px + offset * Math.sin(a);
		const oy = py - offset * Math.cos(a);
		return {
			blade: shape(
				[
					[-w, 0],
					[-w, -(len - w * 4)],
					[0, -len],
					[w, -(len - w * 4)],
					[w, 0]
				],
				angle,
				ox,
				oy
			),
			guard: shape(
				[
					[-w * 3, 0],
					[w * 3, 0],
					[w * 3, 5],
					[-w * 3, 5]
				],
				angle,
				ox,
				oy
			),
			grip: shape(
				[
					[-w * 0.6, 5],
					[w * 0.6, 5],
					[w * 0.6, 18],
					[-w * 0.6, 18]
				],
				angle,
				ox,
				oy
			),
			origin: `${round(ox)} ${round(oy)}`
		};
	}

	const backSwords = Array.from({ length: 27 }, (_, i) => {
		const angle = -64 + (128 * i) / 26 + (rand(i + 1) - 0.5) * 4;
		const len = 120 + 140 * Math.cos((angle * Math.PI * 1.1) / 180) + (rand(i + 50) - 0.5) * 40;
		return sword(angle, len, 5, 40, PIVOT_X, PIVOT_Y);
	});

	const midSwords = Array.from({ length: 17 }, (_, i) => {
		const angle = -50 + (100 * i) / 16 + (rand(i + 100) - 0.5) * 5;
		const len = 90 + 80 * Math.cos((angle * Math.PI * 1.2) / 180) + (rand(i + 150) - 0.5) * 30;
		return sword(angle, len, 4.5, 30, PIVOT_X, PIVOT_Y);
	});

	const armSwords = Array.from({ length: 5 }, (_, i) => {
		const len = 72 + rand(i + 200) * 18;
		const y = 318 + i * 6;
		return [
			sword(-94 + (i - 2) * 7, len, 4, 0, 150, y),
			sword(94 - (i - 2) * 7, len, 4, 0, 250, y)
		];
	}).flat();

	const hangingSwords = Array.from({ length: 7 }, (_, i) =>
		sword(180 + (i - 3) * 3, 38 + rand(i + 300) * 14, 3.5, 0, 146 + i * 18, 368)
	);

	const allSwords = [...backSwords, ...midSwords, ...armSwords, ...hangingSwords];

	const embers = Array.from({ length: 16 }, (_, i) => ({
		cx: round(110 + rand(i + 400) * 180),
		cy: round(430 + rand(i + 450) * 30),
		r: round(1 + rand(i + 500) * 1.6),
		dx: round((rand(i + 550) - 0.5) * 80),
		delay: round(rand(i + 600) * 7),
		duration: round(5 + rand(i + 650) * 4)
	}));

	let tiltEl: HTMLElement | undefined = $state();
	let svgEl: SVGSVGElement | undefined = $state();
	let animated = $state(false);

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || !tiltEl || !svgEl) return;
		animated = true;

		let reverted = false;
		let ctx: { revert: () => void } | undefined;
		let onMove: ((e: PointerEvent) => void) | undefined;

		void (async () => {
			const gsap = (await import('gsap')).default;
			if (reverted || !tiltEl || !svgEl) return;

			ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

				tl.from(svgEl!.querySelectorAll('.body'), {
					y: 40,
					opacity: 0,
					duration: 1,
					stagger: 0.08
				});

				svgEl!.querySelectorAll<SVGGElement>('.sword').forEach((el, i) => {
					tl.from(
						el,
						{
							scale: 0,
							opacity: 0,
							duration: 0.9,
							ease: 'back.out(1.7)',
							svgOrigin: el.dataset.origin
						},
						0.3 + i * 0.022
					);
				});

				const rotY = gsap.quickTo(tiltEl!, 'rotationY', { duration: 0.9, ease: 'power3' });
				const rotX = gsap.quickTo(tiltEl!, 'rotationX', { duration: 0.9, ease: 'power3' });
				onMove = (e: PointerEvent) => {
					rotY((e.clientX / window.innerWidth - 0.5) * 18);
					rotX(-(e.clientY / window.innerHeight - 0.5) * 10);
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
	<div class="tilt" bind:this={tiltEl}>
		<div class="float">
			<svg viewBox="0 0 400 500" bind:this={svgEl}>
				<defs>
					<radialGradient id="throne-glow" cx="50%" cy="55%" r="50%">
						<stop offset="0%" stop-color="#b42828" stop-opacity="0.55" />
						<stop offset="45%" stop-color="#c9a227" stop-opacity="0.14" />
						<stop offset="100%" stop-color="#c9a227" stop-opacity="0" />
					</radialGradient>
					<linearGradient id="throne-steel" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="#3a3631" />
						<stop offset="50%" stop-color="#b9b2a5" />
						<stop offset="100%" stop-color="#2e2a26" />
					</linearGradient>
					<linearGradient id="throne-steel-dark" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stop-color="#25221e" />
						<stop offset="50%" stop-color="#7c766c" />
						<stop offset="100%" stop-color="#1d1a17" />
					</linearGradient>
					<linearGradient id="throne-iron" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#1c1916" />
						<stop offset="45%" stop-color="#4f4942" />
						<stop offset="100%" stop-color="#14120f" />
					</linearGradient>
					<linearGradient id="throne-stone" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stop-color="#3a342d" />
						<stop offset="100%" stop-color="#16130f" />
					</linearGradient>
					<linearGradient
						id="throne-sheen"
						gradientUnits="userSpaceOnUse"
						x1="0"
						y1="0"
						x2="400"
						y2="220"
					>
						<stop offset="0%" stop-color="#fff" stop-opacity="0" />
						<stop offset="44%" stop-color="#fff" stop-opacity="0" />
						<stop offset="50%" stop-color="#fff3c4" stop-opacity="0.75" />
						<stop offset="56%" stop-color="#fff" stop-opacity="0" />
						<stop offset="100%" stop-color="#fff" stop-opacity="0" />
						{#if animated}
							<animateTransform
								attributeName="gradientTransform"
								type="translate"
								values="-500 0; 500 0; 500 0"
								keyTimes="0; 0.55; 1"
								dur="6s"
								repeatCount="indefinite"
							/>
						{/if}
					</linearGradient>
				</defs>

				<ellipse class="glow" cx="200" cy="270" rx="200" ry="230" fill="url(#throne-glow)" />

				{#each backSwords as s}
					<g class="sword" data-origin={s.origin}>
						<path d={s.blade} fill="url(#throne-steel-dark)" />
						<path d={s.blade} fill="url(#throne-sheen)" />
						<path d={s.guard} fill="#3b362f" />
						<path d={s.grip} fill="#1a1714" />
					</g>
				{/each}

				{#each midSwords as s}
					<g class="sword" data-origin={s.origin}>
						<path d={s.blade} fill="url(#throne-steel)" />
						<path d={s.blade} fill="url(#throne-sheen)" />
						<path d={s.guard} fill="#4a443b" />
						<path d={s.grip} fill="#1f1b17" />
					</g>
				{/each}

				<g class="body">
					<path d="M150,348 L156,222 Q200,168 244,222 L250,348 Z" fill="url(#throne-iron)" />
					{#each [168, 184, 200, 216, 232] as x}
						<line x1={x} y1="344" x2={x} y2={x === 200 ? 200 : 214} stroke="#0d0b09" stroke-opacity="0.7" stroke-width="2" />
					{/each}
					<path d="M156,222 Q200,168 244,222" fill="none" stroke="#8a7020" stroke-opacity="0.5" stroke-width="1.5" />
				</g>

				<g class="body">
					<path d="M136,366 L264,366 L274,424 L126,424 Z" fill="url(#throne-iron)" />
				</g>

				{#each hangingSwords as s}
					<g class="sword" data-origin={s.origin}>
						<path d={s.blade} fill="url(#throne-steel)" />
						<path d={s.blade} fill="url(#throne-sheen)" />
						<path d={s.guard} fill="#4a443b" />
					</g>
				{/each}

				<g class="body">
					<path d="M130,344 L270,344 L278,368 L122,368 Z" fill="#3a352f" />
					<path d="M130,344 L270,344" stroke="#c9a227" stroke-opacity="0.35" stroke-width="1.5" />
				</g>

				{#each armSwords as s}
					<g class="sword" data-origin={s.origin}>
						<path d={s.blade} fill="url(#throne-steel)" />
						<path d={s.blade} fill="url(#throne-sheen)" />
						<path d={s.guard} fill="#4a443b" />
						<path d={s.grip} fill="#1f1b17" />
					</g>
				{/each}

				<g class="body">
					<rect x="92" y="424" width="216" height="18" fill="url(#throne-stone)" />
					<rect x="66" y="442" width="268" height="18" fill="url(#throne-stone)" />
					<rect x="40" y="460" width="320" height="22" fill="url(#throne-stone)" />
					<path d="M92,424 h216 M66,442 h268 M40,460 h320" stroke="#c9a227" stroke-opacity="0.18" />
				</g>

				{#each embers as e}
					<circle
						class="ember"
						cx={e.cx}
						cy={e.cy}
						r={e.r}
						style="--dx: {e.dx}px; animation-delay: {e.delay}s; animation-duration: {e.duration}s"
					/>
				{/each}
			</svg>
		</div>
	</div>
</div>

<style>
	.stage {
		width: 100%;
		height: 100%;
		perspective: 900px;
	}

	.tilt {
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

	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
		filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.7));
	}

	.glow {
		transform-box: fill-box;
		transform-origin: center;
		animation: pulse 4.5s ease-in-out infinite;
	}

	.ember {
		fill: #ffb347;
		opacity: 0;
		animation-name: rise;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		filter: drop-shadow(0 0 3px #ff7a1a);
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-14px);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.75;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.06);
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
			transform: translate(var(--dx), -340px);
		}
	}
</style>
