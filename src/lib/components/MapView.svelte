<script lang="ts">
	import { locations, type Location } from '#lib/data';
	import { locale, localized, t } from '#lib/i18n/store';

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

	function select(loc: Location) {
		selected = loc;
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		const next = Math.min(2.4, Math.max(0.8, scale + (e.deltaY > 0 ? -0.08 : 0.08)));
		scale = next;
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
</script>

<div class="map-shell">
	<div class="toolbar">
		<div class="filters" role="group" aria-label="Filter">
			<button class:active={filter === 'all'} onclick={() => (filter = 'all')}>
				{$t('map.filterAll')}
			</button>
			<button class:active={filter === 'westeros'} onclick={() => (filter = 'westeros')}>
				{$t('map.filterWesteros')}
			</button>
			<button class:active={filter === 'essos'} onclick={() => (filter = 'essos')}>
				{$t('map.filterEssos')}
			</button>
		</div>
		<button class="reset" type="button" onclick={resetView}>Reset</button>
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
			<div
				class="canvas"
				style={`transform: translate(${tx}px, ${ty}px) scale(${scale})`}
			>
				<img class="basemap" src="/images/map/realms.svg" alt="" draggable="false" />
				{#each filtered as loc (loc.id)}
					<button
						type="button"
						class="marker"
						class:active={selected?.id === loc.id}
						style={`left:${loc.x}%; top:${loc.y}%`}
						onclick={() => select(loc)}
						aria-label={localized(loc.name, $locale)}
					>
						<span class="dot"></span>
						<span class="label">{localized(loc.name, $locale)}</span>
					</button>
				{/each}
			</div>
		</div>

		<aside class="panel" class:has-selection={!!selected}>
			{#if selected}
				<button class="close" type="button" onclick={() => (selected = null)}>
					{$t('map.close')}
				</button>
				<p class="continent">
					{$t('map.continent')}:
					{selected.continent === 'westeros'
						? $t('map.filterWesteros')
						: $t('map.filterEssos')}
				</p>
				<h2>{localized(selected.name, $locale)}</h2>
				<p class="region">{localized(selected.region, $locale)}</p>
				<p>{localized(selected.description, $locale)}</p>
			{:else}
				<p class="hint">{$t('map.selectHint')}</p>
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
	.reset {
		padding: 0.55rem 0.9rem;
		font-family: var(--font-display);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.filters button.active {
		background: var(--gold);
		color: var(--bg);
	}

	.reset {
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.reset:hover,
	.filters button:hover {
		color: var(--gold);
	}

	.stage-wrap {
		display: grid;
		grid-template-columns: 1fr min(320px, 100%);
		gap: 1rem;
		min-height: 560px;
	}

	.stage {
		position: relative;
		overflow: hidden;
		border: 1px solid var(--border);
		background: #071018;
		border-radius: var(--radius);
		cursor: grab;
		touch-action: none;
		min-height: 480px;
	}

	.stage.dragging {
		cursor: grabbing;
	}

	.canvas {
		position: absolute;
		inset: 0;
		transform-origin: center center;
		will-change: transform;
	}

	.basemap {
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		pointer-events: none;
	}

	.marker {
		position: absolute;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		z-index: 2;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--gold);
		box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.25);
		transition:
			transform 0.25s var(--ease),
			box-shadow 0.25s var(--ease);
	}

	.marker:hover .dot,
	.marker.active .dot {
		transform: scale(1.35);
		box-shadow: 0 0 0 5px rgba(201, 162, 39, 0.35), 0 0 18px var(--glow);
	}

	.label {
		font-family: var(--font-display);
		font-size: 0.65rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text);
		background: rgba(11, 10, 9, 0.75);
		padding: 0.15rem 0.4rem;
		border: 1px solid var(--border);
		white-space: nowrap;
		opacity: 0;
		transform: translateY(4px);
		transition:
			opacity 0.25s var(--ease),
			transform 0.25s var(--ease);
	}

	.marker:hover .label,
	.marker.active .label {
		opacity: 1;
		transform: translateY(0);
	}

	.panel {
		border: 1px solid var(--border);
		background: var(--bg-card);
		padding: 1.25rem;
		border-radius: var(--radius);
		min-height: 200px;
	}

	.close {
		float: right;
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.close:hover {
		color: var(--gold);
	}

	.continent {
		margin: 0 0 0.5rem;
		color: var(--gold);
		font-family: var(--font-display);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	h2 {
		margin: 0 0 0.35rem;
		font-size: 1.4rem;
		color: var(--text);
	}

	.region {
		margin: 0 0 1rem;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.hint {
		margin: 2rem 0 0;
		color: var(--muted);
		text-align: center;
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
	}
</style>
