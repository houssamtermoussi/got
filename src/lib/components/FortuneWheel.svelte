<script module lang="ts">
	export type WheelItem = {
		id: string;
		label: string;
		color: string;
		image?: string;
	};
</script>

<script lang="ts">
	let {
		items,
		spinLabel,
		spinningLabel,
		disabled = false,
		onSelect
	}: {
		items: WheelItem[];
		spinLabel: string;
		spinningLabel: string;
		disabled?: boolean;
		onSelect: (item: WheelItem) => void;
	} = $props();

	let spinning = $state(false);
	let rotation = $state(0);
	let selectedId = $state<string | null>(null);

	const size = 420;
	const cx = size / 2;
	const cy = size / 2;
	const radius = 188;
	const labelRadius = 118;

	const segments = $derived.by(() => {
		const n = items.length;
		if (n === 0) return [];
		const angle = (Math.PI * 2) / n;
		return items.map((item, i) => {
			const start = i * angle - Math.PI / 2;
			const end = start + angle;
			const mid = start + angle / 2;
			const large = angle > Math.PI ? 1 : 0;
			const x1 = cx + radius * Math.cos(start);
			const y1 = cy + radius * Math.sin(start);
			const x2 = cx + radius * Math.cos(end);
			const y2 = cy + radius * Math.sin(end);
			const lx = cx + labelRadius * Math.cos(mid);
			const ly = cy + labelRadius * Math.sin(mid);
			const deg = (mid * 180) / Math.PI;
			const flip = deg > 90 && deg < 270;
			return {
				item,
				path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`,
				lx,
				ly,
				rotate: flip ? deg + 180 : deg,
				showLabel: n <= 12
			};
		});
	});

	function prefersReducedMotion() {
		return (
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	async function spin() {
		if (spinning || disabled || items.length === 0) return;
		spinning = true;
		selectedId = null;

		const winnerIndex = Math.floor(Math.random() * items.length);
		const winner = items[winnerIndex];
		const segmentDeg = 360 / items.length;
		const centerOffset = winnerIndex * segmentDeg + segmentDeg / 2;
		const extraSpins = 4 + Math.floor(Math.random() * 3);
		const jitter = (Math.random() - 0.5) * segmentDeg * 0.55;
		const target = rotation + extraSpins * 360 + (360 - centerOffset) + jitter;
		const delta = target - rotation;

		if (prefersReducedMotion()) {
			rotation = target;
			selectedId = winner.id;
			spinning = false;
			onSelect(winner);
			return;
		}

		const gsap = (await import('gsap')).default;
		const state = { value: rotation };

		gsap.to(state, {
			value: target,
			duration: Math.min(5.5, 3.2 + delta / 720),
			ease: 'power4.out',
			onUpdate: () => {
				rotation = state.value;
			},
			onComplete: () => {
				rotation = target;
				selectedId = winner.id;
				spinning = false;
				onSelect(winner);
			}
		});
	}
</script>

<div class="wheel-ui">
	<div class="stage" aria-live="polite">
		<div class="pointer" aria-hidden="true"></div>
		<svg
			class="wheel"
			class:spinning
			viewBox={`0 0 ${size} ${size}`}
			style={`transform: rotate(${rotation}deg)`}
			role="img"
			aria-label={spinning ? spinningLabel : spinLabel}
		>
			<defs>
				<filter id="wheel-glow" x="-20%" y="-20%" width="140%" height="140%">
					<feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#c9a227" flood-opacity="0.35" />
				</filter>
				<radialGradient id="wheel-hub" cx="50%" cy="40%" r="65%">
					<stop offset="0%" stop-color="#2a2318" />
					<stop offset="100%" stop-color="#0c0a08" />
				</radialGradient>
			</defs>

			<circle cx={cx} cy={cy} r={radius + 8} fill="#0a0908" stroke="var(--gold)" stroke-width="2" />

			{#each segments as seg}
				<path
					d={seg.path}
					fill={seg.item.color}
					stroke="rgba(7,6,5,0.65)"
					stroke-width="1.5"
					opacity={selectedId && selectedId !== seg.item.id ? 0.45 : 0.92}
					class:winner={selectedId === seg.item.id}
				/>
				{#if seg.showLabel}
					<text
						x={seg.lx}
						y={seg.ly}
						transform={`rotate(${seg.rotate} ${seg.lx} ${seg.ly})`}
						text-anchor="middle"
						dominant-baseline="middle"
						class="seg-label"
					>
						{seg.item.label}
					</text>
				{/if}
			{/each}

			<circle cx={cx} cy={cy} r="42" fill="url(#wheel-hub)" stroke="var(--gold)" stroke-width="2" filter="url(#wheel-glow)" />
			<circle cx={cx} cy={cy} r="28" fill="none" stroke="rgba(201,162,39,0.35)" stroke-width="1" />
			<text x={cx} y={cy + 1} text-anchor="middle" dominant-baseline="middle" class="hub-mark">⚔</text>
		</svg>
	</div>

	<button class="btn spin-btn" type="button" onclick={spin} disabled={spinning || disabled}>
		{spinning ? spinningLabel : spinLabel}
	</button>
</div>

<style>
	.wheel-ui {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.75rem;
	}

	.stage {
		position: relative;
		width: min(100%, 420px);
		aspect-ratio: 1;
	}

	.pointer {
		position: absolute;
		top: -6px;
		left: 50%;
		z-index: 2;
		width: 0;
		height: 0;
		transform: translateX(-50%);
		border-left: 14px solid transparent;
		border-right: 14px solid transparent;
		border-top: 28px solid var(--gold);
		filter: drop-shadow(0 4px 10px rgba(201, 162, 39, 0.45));
	}

	.pointer::after {
		content: '';
		position: absolute;
		top: -28px;
		left: -5px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--gold);
		box-shadow: 0 0 12px var(--glow);
	}

	.wheel {
		width: 100%;
		height: 100%;
		transform-origin: 50% 50%;
		will-change: transform;
	}

	.wheel.spinning {
		filter: saturate(1.1);
	}

	path.winner {
		opacity: 1;
		filter: brightness(1.15);
	}

	.seg-label {
		fill: #f4efe6;
		font-family: var(--font-display);
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		paint-order: stroke fill;
		stroke: rgba(0, 0, 0, 0.55);
		stroke-width: 2.5px;
		pointer-events: none;
		user-select: none;
	}

	.hub-mark {
		fill: var(--gold);
		font-size: 18px;
		pointer-events: none;
	}

	.spin-btn {
		min-width: 12rem;
	}

	.spin-btn:disabled {
		opacity: 0.65;
		cursor: wait;
		transform: none;
		box-shadow: none;
		filter: none;
	}

	@media (max-width: 520px) {
		.seg-label {
			font-size: 9px;
		}
	}
</style>
