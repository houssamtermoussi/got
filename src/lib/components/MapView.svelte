<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { getHouse, locations, type Location } from '#lib/data';
	import { locale, localized, t } from '#lib/i18n/store';
	import { media } from '#lib/media';

	type Filter = 'all' | 'westeros' | 'essos';
	type PointerState = { x: number; y: number };

	let filter: Filter = $state('all');
	let selected: Location | null = $state(null);
	let scale = $state(1);
	let tx = $state(0);
	let ty = $state(0);
	let dragging = $state(false);
	let panelEl: HTMLElement | undefined = $state();

	const pointers = new Map<number, PointerState>();
	let pinchStartDist = 0;
	let pinchStartScale = 1;
	let panOriginX = 0;
	let panOriginY = 0;
	let panStartTx = 0;
	let panStartTy = 0;

	const filtered = $derived(
		locations.filter((l) => filter === 'all' || l.continent === filter)
	);

	const selectedHouse = $derived(selected?.houseId ? getHouse(selected.houseId) : undefined);

	function select(loc: Location) {
		selected = loc;
		if (typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches) {
			queueMicrotask(() => {
				panelEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			});
		}
	}

	function setFilter(next: Filter) {
		filter = next;
		if (selected && next !== 'all' && selected.continent !== next) {
			selected = null;
		}
	}

	function clampScale(value: number) {
		return Math.min(2.6, Math.max(0.75, value));
	}

	function zoomBy(delta: number) {
		scale = clampScale(scale + delta);
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		zoomBy(e.deltaY > 0 ? -0.08 : 0.08);
	}

	function pointerDistance(a: PointerState, b: PointerState) {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		return Math.hypot(dx, dy);
	}

	function pointerMidpoint(a: PointerState, b: PointerState) {
		return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
	}

	function beginPan(x: number, y: number) {
		panOriginX = x;
		panOriginY = y;
		panStartTx = tx;
		panStartTy = ty;
		dragging = true;
	}

	function beginPinch() {
		const [a, b] = [...pointers.values()];
		pinchStartDist = pointerDistance(a, b) || 1;
		pinchStartScale = scale;
		const mid = pointerMidpoint(a, b);
		beginPan(mid.x, mid.y);
	}

	function onPointerDown(e: PointerEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('.marker') && pointers.size === 0) return;

		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

		if (pointers.size === 1) {
			beginPan(e.clientX, e.clientY);
		} else if (pointers.size === 2) {
			beginPinch();
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (!pointers.has(e.pointerId)) return;
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

		if (pointers.size === 1) {
			const p = pointers.values().next().value!;
			tx = panStartTx + (p.x - panOriginX);
			ty = panStartTy + (p.y - panOriginY);
			dragging = true;
			return;
		}

		if (pointers.size >= 2) {
			const [a, b] = [...pointers.values()];
			const dist = pointerDistance(a, b) || 1;
			scale = clampScale(pinchStartScale * (dist / pinchStartDist));
			const mid = pointerMidpoint(a, b);
			tx = panStartTx + (mid.x - panOriginX);
			ty = panStartTy + (mid.y - panOriginY);
			dragging = true;
		}
	}

	function onPointerUp(e: PointerEvent) {
		pointers.delete(e.pointerId);
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* ignore */
		}

		if (pointers.size === 1) {
			const remaining = pointers.values().next().value!;
			beginPan(remaining.x, remaining.y);
			return;
		}

		if (pointers.size === 0) {
			dragging = false;
		} else if (pointers.size === 2) {
			beginPinch();
		}
	}

	function resetView() {
		scale = 1;
		tx = 0;
		ty = 0;
	}

	function markerAccent(loc: Location): string {
		const house = loc.houseId ? getHouse(loc.houseId) : undefined;
		if (house) return house.color;
		return loc.continent === 'essos' ? '#c45c26' : '#c9a227';
	}
</script>

<div class="map-shell">
	<div class="toolbar">
		<div class="filters" role="group" aria-label="Filter">
			<button class:active={filter === 'all'} onclick={() => setFilter('all')}>
				{$t('map.filterAll')}
			</button>
			<button class:active={filter === 'westeros'} onclick={() => setFilter('westeros')}>
				{$t('map.filterWesteros')}
			</button>
			<button class:active={filter === 'essos'} onclick={() => setFilter('essos')}>
				{$t('map.filterEssos')}
			</button>
		</div>
		<div class="zoom-controls">
			<button type="button" onclick={() => zoomBy(0.15)} aria-label={$t('map.zoomIn')}>+</button>
			<button type="button" onclick={() => zoomBy(-0.15)} aria-label={$t('map.zoomOut')}>−</button>
			<button class="reset" type="button" onclick={resetView}>{$t('map.reset')}</button>
		</div>
	</div>

	<div class="stage-wrap">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="stage"
			class:dragging
			onwheel={onWheel}
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}
			role="application"
			aria-label={$t('map.title')}
		>
			<div class="vignette" aria-hidden="true"></div>
			<div
				class="pan-layer"
				style={`transform: translate(${tx}px, ${ty}px) scale(${scale})`}
			>
				<div class="canvas">
					<img class="basemap" src={asset('/images/map/realms.svg')} alt="" draggable="false" />
					{#each filtered as loc (loc.id)}
						<button
							type="button"
							class="marker"
							class:active={selected?.id === loc.id}
							class:essos={loc.continent === 'essos'}
							style={`left:${loc.x}%; top:${loc.y}%; --marker:${markerAccent(loc)}`}
							onclick={() => select(loc)}
							aria-label={localized(loc.name, $locale)}
							aria-pressed={selected?.id === loc.id}
						>
							<span class="pulse" aria-hidden="true"></span>
							<span class="dot"></span>
							<span class="label">{localized(loc.name, $locale)}</span>
						</button>
					{/each}
				</div>
			</div>
			<p class="scale-badge" aria-hidden="true">{Math.round(scale * 100)}%</p>
		</div>

		<aside class="panel" class:has-selection={!!selected} bind:this={panelEl}>
			{#if selected}
				<button class="close" type="button" onclick={() => (selected = null)}>
					{$t('map.close')}
				</button>

				<div class="panel-top">
					<span class="badge continent-badge">
						{selected.continent === 'westeros'
							? $t('map.filterWesteros')
							: $t('map.filterEssos')}
					</span>
					<span class="badge type-badge">{localized(selected.type, $locale)}</span>
				</div>

				<h2>{localized(selected.name, $locale)}</h2>
				<p class="region">{localized(selected.region, $locale)}</p>

				{#if selectedHouse}
					<a class="house-link" href={resolve('/maisons/[id]', { id: selectedHouse.id })}>
						<img src={media(selectedHouse.sigil)} alt="" class="house-sigil" />
						<div>
							<span class="house-label">{$t('map.rulingHouse')}</span>
							<strong style={`color:${selectedHouse.color}`}
								>{localized(selectedHouse.name, $locale)}</strong
							>
							<em>« {localized(selectedHouse.words, $locale)} »</em>
						</div>
					</a>
				{/if}

				<p class="desc">{localized(selected.description, $locale)}</p>

				{#if selected.notable[$locale]?.length}
					<div class="notable">
						<h3>{$t('map.notable')}</h3>
						<ul>
							{#each selected.notable[$locale] as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				{/if}
			{:else}
				<div class="empty">
					<span class="empty-mark" aria-hidden="true">✦</span>
					<p class="hint">{$t('map.selectHint')}</p>
					<p class="count">{$t('map.placesCount').replace('{n}', String(filtered.length))}</p>
				</div>
			{/if}
		</aside>
	</div>
</div>

<style>
	.map-shell {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: center;
	}

	.filters {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.filters button,
	.zoom-controls button {
		padding: 0.55rem 0.9rem;
		font-family: var(--font-display);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.filters button.active {
		background: var(--gold);
		color: var(--bg);
	}

	.zoom-controls {
		display: inline-flex;
		gap: 0.4rem;
		align-items: center;
	}

	.zoom-controls button {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		min-width: 2.25rem;
	}

	.reset {
		padding-inline: 0.85rem !important;
	}

	.zoom-controls button:hover,
	.filters button:hover {
		color: var(--gold);
	}

	.stage-wrap {
		display: grid;
		grid-template-columns: 1fr min(340px, 100%);
		gap: 1rem;
		min-height: 580px;
	}

	.stage {
		position: relative;
		overflow: hidden;
		border: 1px solid var(--border);
		background:
			radial-gradient(ellipse at 30% 40%, rgba(26, 74, 92, 0.35), transparent 55%),
			#071018;
		border-radius: var(--radius);
		cursor: grab;
		touch-action: none;
		min-height: 520px;
		height: 100%;
		box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.45);
		container-type: size;
	}

	.stage.dragging {
		cursor: grabbing;
	}

	.vignette {
		pointer-events: none;
		position: absolute;
		inset: 0;
		z-index: 3;
		box-shadow: inset 0 0 90px rgba(0, 0, 0, 0.55);
		background: linear-gradient(
			180deg,
			rgba(11, 10, 9, 0.25) 0%,
			transparent 18%,
			transparent 82%,
			rgba(11, 10, 9, 0.35) 100%
		);
	}

	.pan-layer {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		transform-origin: center center;
		will-change: transform;
	}

	.canvas {
		position: relative;
		width: min(100cqw, calc(100cqh * 10 / 7));
		max-width: 100%;
	}

	.basemap {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 10 / 7;
		user-select: none;
		pointer-events: none;
		-webkit-user-drag: none;
	}

	.scale-badge {
		position: absolute;
		right: 0.75rem;
		bottom: 0.65rem;
		z-index: 4;
		margin: 0;
		padding: 0.2rem 0.45rem;
		font-family: var(--font-display);
		font-size: 0.65rem;
		letter-spacing: 0.08em;
		color: var(--muted);
		background: rgba(11, 10, 9, 0.7);
		border: 1px solid var(--border);
	}

	.marker {
		position: absolute;
		transform: translate(-50%, -50%);
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		z-index: 2;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		touch-action: manipulation;
	}

	.pulse {
		position: absolute;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--marker, var(--gold));
		opacity: 0.45;
		animation: pulse 2.4s var(--ease) infinite;
		pointer-events: none;
	}

	.dot {
		position: relative;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--marker, var(--gold));
		box-shadow:
			0 0 0 3px color-mix(in srgb, var(--marker, var(--gold)) 30%, transparent),
			0 0 12px color-mix(in srgb, var(--marker, var(--gold)) 45%, transparent);
		transition:
			transform 0.25s var(--ease),
			box-shadow 0.25s var(--ease);
		pointer-events: none;
	}

	.marker:hover .dot,
	.marker.active .dot {
		transform: scale(1.4);
		box-shadow:
			0 0 0 5px color-mix(in srgb, var(--marker, var(--gold)) 35%, transparent),
			0 0 20px color-mix(in srgb, var(--marker, var(--gold)) 55%, transparent);
	}

	.marker.active .pulse {
		animation: none;
		opacity: 0;
	}

	.label {
		position: absolute;
		top: calc(100% - 0.15rem);
		left: 50%;
		font-family: var(--font-display);
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text);
		background: rgba(11, 10, 9, 0.82);
		padding: 0.2rem 0.45rem;
		border: 1px solid color-mix(in srgb, var(--marker, var(--gold)) 40%, var(--border));
		white-space: nowrap;
		opacity: 0;
		transform: translate(-50%, 4px);
		transition:
			opacity 0.25s var(--ease),
			transform 0.25s var(--ease);
		pointer-events: none;
	}

	.marker:hover .label,
	.marker.active .label {
		opacity: 1;
		transform: translate(-50%, 0);
	}

	.panel {
		border: 1px solid var(--border);
		background:
			linear-gradient(160deg, rgba(201, 162, 39, 0.05), transparent 40%),
			var(--bg-card);
		padding: 1.35rem;
		border-radius: var(--radius);
		min-height: 220px;
		position: relative;
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		background: none;
		border: none;
		cursor: pointer;
		min-height: 44px;
		padding-inline: 0.5rem;
	}

	.close:hover {
		color: var(--gold);
	}

	.panel-top {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0 2.5rem 0.85rem 0;
	}

	.badge {
		font-family: var(--font-display);
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--border);
		color: var(--muted);
	}

	.continent-badge {
		color: var(--gold);
		border-color: color-mix(in srgb, var(--gold) 45%, transparent);
	}

	.type-badge {
		color: var(--text);
	}

	h2 {
		margin: 0 0 0.25rem;
		font-size: 1.45rem;
		color: var(--text);
	}

	.region {
		margin: 0 0 1rem;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.house-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0 0 1.1rem;
		padding: 0.7rem 0.8rem;
		border: 1px solid var(--border);
		background: rgba(0, 0, 0, 0.22);
		text-decoration: none;
		color: inherit;
		transition:
			border-color 0.25s var(--ease),
			background 0.25s var(--ease);
	}

	.house-link:hover {
		border-color: var(--gold);
		background: rgba(201, 162, 39, 0.08);
	}

	.house-sigil {
		width: 42px;
		height: 42px;
		object-fit: contain;
		flex-shrink: 0;
	}

	.house-label {
		display: block;
		font-family: var(--font-display);
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.15rem;
	}

	.house-link strong {
		display: block;
		font-family: var(--font-display);
		font-size: 0.92rem;
		font-weight: 600;
	}

	.house-link em {
		display: block;
		margin-top: 0.15rem;
		font-size: 0.78rem;
		color: var(--muted);
		font-style: italic;
	}

	.desc {
		margin: 0 0 1.1rem;
		color: var(--text);
		font-size: 0.92rem;
		line-height: 1.7;
	}

	.notable h3 {
		margin: 0 0 0.5rem;
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
	}

	.notable ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.notable li {
		font-size: 0.78rem;
		padding: 0.28rem 0.55rem;
		border: 1px solid var(--border);
		color: var(--muted);
		background: rgba(0, 0, 0, 0.2);
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 220px;
		text-align: center;
		gap: 0.5rem;
	}

	.empty-mark {
		color: var(--gold);
		opacity: 0.55;
		font-size: 1.2rem;
	}

	.hint {
		margin: 0;
		color: var(--muted);
		max-width: 16rem;
	}

	.count {
		margin: 0.35rem 0 0;
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--muted) 70%, transparent);
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 0.45;
		}
		70% {
			transform: scale(2.6);
			opacity: 0;
		}
		100% {
			transform: scale(2.6);
			opacity: 0;
		}
	}

	@media (max-width: 900px) {
		.stage-wrap {
			grid-template-columns: 1fr;
			min-height: 0;
		}

		.stage {
			width: 100%;
			height: auto;
			min-height: 0;
			aspect-ratio: 10 / 7;
			max-height: min(62vh, 480px);
		}

		.canvas {
			width: 100%;
		}

		.filters button,
		.zoom-controls button {
			padding: 0.7rem 0.95rem;
			min-height: 44px;
		}

		.panel.has-selection {
			outline: 1px solid color-mix(in srgb, var(--gold) 35%, transparent);
		}
	}

	@media (pointer: coarse) {
		.marker.active .label {
			opacity: 1;
			transform: translate(-50%, 0);
		}

		.dot {
			width: 14px;
			height: 14px;
		}

		.pulse {
			width: 14px;
			height: 14px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dot,
		.label {
			transition: none;
		}

		.pulse {
			animation: none;
			opacity: 0;
		}
	}
</style>
