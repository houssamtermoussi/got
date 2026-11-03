<script lang="ts">
	import type { House } from '#lib/data';
	import { localized, locale } from '#lib/i18n/store';

	let { house }: { house: House } = $props();
</script>

<a class="card" href={`/maisons/${house.id}`} style={`--accent:${house.color}`}>
	<div class="sigil-wrap">
		<img class="sigil" src={house.sigil} alt="" loading="lazy" />
	</div>
	<div class="body">
		<h3>{localized(house.name, $locale)}</h3>
		<p class="words">« {localized(house.words, $locale)} »</p>
		<p class="meta">{localized(house.region, $locale)}</p>
	</div>
</a>

<style>
	.card {
		display: grid;
		grid-template-columns: 96px 1fr;
		gap: 1rem;
		align-items: center;
		padding: 1rem;
		color: inherit;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		transition:
			transform 0.35s var(--ease),
			box-shadow 0.35s var(--ease),
			border-color 0.35s var(--ease);
	}

	.card:hover {
		transform: translateY(-4px);
		border-color: color-mix(in srgb, var(--accent) 55%, var(--gold));
		box-shadow: 0 0 28px color-mix(in srgb, var(--accent) 30%, transparent);
		color: inherit;
	}

	.sigil-wrap {
		width: 96px;
		height: 112px;
		display: grid;
		place-items: center;
		background: #0a0908;
		border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
		overflow: hidden;
	}

	.sigil {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.45s var(--ease);
	}

	.card:hover .sigil {
		transform: scale(1.06);
	}

	h3 {
		margin: 0 0 0.35rem;
		font-size: 1.05rem;
	}

	.words {
		margin: 0;
		font-style: italic;
		color: var(--gold);
		font-size: 0.9rem;
	}

	.meta {
		margin: 0.45rem 0 0;
		color: var(--muted);
		font-size: 0.82rem;
		font-family: var(--font-display);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
</style>
