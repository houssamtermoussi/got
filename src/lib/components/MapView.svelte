<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { getHouse, locations, type Location } from '#lib/data';
	import { locale, localized, t } from '#lib/i18n/store';
	import { media } from '#lib/media';

	type Filter = 'all' | 'westeros' | 'essos';

	let filter: Filter = $state('all');
	let selected: Location | null = $state(null);
	let scale = $state(1);
	let tx = $state(0);
	let ty = $state(0);
	let dragging = $state(false);
	let lastX = 0;
	let lastY = 0;

	const filtered = $derived(
		locations.filter((l) => filter === 'all' || l.continent === filter)
	);

	const selectedHouse = $derived(selected?.houseId ? getHouse(selected.houseId) : undefined);

	function select(loc: Location) {
		selected = loc;
	}

	function setFilter(next: Filter) {
		filter = next;
		if (selected && next !== 'all' && selected.continent !== next) {
			selected = null;
		}
	}

	function zoomBy(delta: number) {
		scale = Math.min(2.6, Math.max(0.75, scale + delta));
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		zoomBy(e.deltaY > 0 ? -0.08 : 0.08);
	}

	function onPointerDown(e: PointerEvent) {
		const target = e.target as HTMLElement;
		if (target.closest('.marker')) return;
		dragging = true;
		lastX = e.clientX;
		lastY = e.clientY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		tx += e.clientX - lastX;
		ty += e.clientY - lastY;
		lastX = e.clientX;
		lastY = e.clientY;
	}

	function onPointerUp(e: PointerEvent) {
		dragging = false;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* ignore */
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

		<aside class="panel" class:has-selection={!!selected}>
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
	}

	.basemap {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 10 / 7;
		user-select: none;
		pointer-events: none;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		z-index: 2;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.pulse {
		position: absolute;
		top: 0;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--marker, var(--gold));
		opacity: 0.45;
		animation: pulse 2.4s var(--ease) infinite;
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
		transform: translateY(4px);
		transition:
			opacity 0.25s var(--ease),
			transform 0.25s var(--ease);
		pointer-events: none;
	}

	.marker:hover .label,
	.marker.active .label {
		opacity: 1;
		transform: translateY(0);
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
