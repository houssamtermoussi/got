<script lang="ts">
	import Reveal from '#lib/components/Reveal.svelte';
	import { episodeRatingsDate, seasons } from '#lib/data';
	import { locale, localized, t } from '#lib/i18n/store';

	let selected = $state(seasons[0].number);
	const season = $derived(seasons.find((s) => s.number === selected) ?? seasons[0]);

	const intlLocale = $derived($locale === 'fr' ? 'fr-FR' : 'en-US');
	const ratingFormat = $derived(
		new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
	);
	const countFormat = $derived(new Intl.NumberFormat(intlLocale));
	// Air dates are plain calendar days: format in UTC so they never shift with the viewer's timezone.
	const dateFormat = $derived(
		new Intl.DateTimeFormat(intlLocale, { dateStyle: 'long', timeZone: 'UTC' })
	);

	function formatDate(iso: string) {
		return dateFormat.format(new Date(`${iso}T00:00:00Z`));
	}

	function tier(value: number) {
		// Compare the value as displayed (one decimal), so an 8.98 average shown as "9.0" gets the 9.0 colour.
		const rating = Math.round(value * 10) / 10;
		if (rating >= 9.5) return 'legendary';
		if (rating >= 9) return 'great';
		if (rating >= 8) return 'good';
		if (rating >= 7) return 'mixed';
		return 'low';
	}
</script>

<svelte:head>
	<title>{$t('episodes.title')} — {$t('brand')}</title>
</svelte:head>

<section class="section">
	<div class="container">
		<Reveal>
			<h1 class="section-title">{$t('episodes.title')}</h1>
			<p class="section-lead">{$t('episodes.lead')}</p>
		</Reveal>

		<Reveal delay={60}>
			<div class="seasons" role="group" aria-label={$t('episodes.seasons')}>
				{#each seasons as s (s.number)}
					<button
						type="button"
						class:active={s.number === selected}
						aria-pressed={s.number === selected}
						onclick={() => (selected = s.number)}
					>
						<span class="label">{$t('episodes.season')}</span>
						<span class="number">{s.number}</span>
						<span class="avg">★ {ratingFormat.format(s.averageRating)}</span>
					</button>
				{/each}
			</div>
		</Reveal>

		<Reveal delay={100}>
			<div class="summary">
				<h2>{$t('episodes.season')} {season.number}</h2>
				<dl>
					<div>
						<dt>{$t('episodes.year')}</dt>
						<dd>{season.year}</dd>
					</div>
					<div>
						<dt>{$t('episodes.count')}</dt>
						<dd>{season.episodes.length}</dd>
					</div>
					<div>
						<dt>{$t('episodes.average')}</dt>
						<dd class="tier-{tier(season.averageRating)}">
							{ratingFormat.format(season.averageRating)}<small>/10</small>
						</dd>
					</div>
					<div>
						<dt>{$t('episodes.best')}</dt>
						<dd class="tier-{tier(season.topRating)}">
							{ratingFormat.format(season.topRating)}<small>/10</small>
						</dd>
					</div>
				</dl>
			</div>
		</Reveal>

		<ol class="list">
			{#each season.episodes as episode, i (episode.imdbId)}
				<li>
					<Reveal delay={i * 40}>
						<article class="row tier-{tier(episode.rating)}">
							<span class="index" aria-hidden="true">{episode.number}</span>
							<div class="info">
								<h3>{localized(episode.title, $locale)}</h3>
								{#if $locale === 'fr' && episode.title.en !== episode.title.fr}
									<p class="original" lang="en">{episode.title.en}</p>
								{/if}
								<p class="meta">
									{formatDate(episode.airDate)} · {$t('episodes.minutes').replace(
										'{n}',
										String(episode.runtime)
									)}
								</p>
								{#if episode.rating === season.topRating}
									<p class="top">★ {$t('episodes.topRated')}</p>
								{/if}
							</div>
							<a
								class="score"
								href={`https://www.imdb.com/title/${episode.imdbId}/`}
								target="_blank"
								rel="noopener noreferrer"
								title={$t('episodes.imdbLink')}
							>
								<span class="value">
									{ratingFormat.format(episode.rating)}<small>/10</small>
								</span>
								<span class="bar" aria-hidden="true">
									<span style={`width:${episode.rating * 10}%`}></span>
								</span>
								<span class="votes">
									{$t('episodes.votes').replace('{n}', countFormat.format(episode.votes))}
								</span>
							</a>
						</article>
					</Reveal>
				</li>
			{/each}
		</ol>

		<p class="source">
			{$t('episodes.source').replace('{date}', formatDate(episodeRatingsDate))}
		</p>
	</div>
</section>

<style>
	.tier-legendary {
		--tier: #e9c95c;
	}

	.tier-great {
		--tier: var(--gold);
	}

	.tier-good {
		--tier: #b9ad97;
	}

	.tier-mixed {
		--tier: #8ba0b8;
	}

	.tier-low {
		--tier: #d4504c;
	}

	.seasons {
		display: grid;
		grid-template-columns: repeat(8, minmax(0, 1fr));
		gap: 0.5rem;
		margin-bottom: 2.5rem;
	}

	.seasons button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		padding: 0.8rem 0.25rem 0.7rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--muted);
		transition:
			color 0.25s var(--ease),
			background 0.25s var(--ease),
			border-color 0.25s var(--ease),
			transform 0.25s var(--ease);
	}

	.seasons button:hover {
		color: var(--gold);
		border-color: var(--gold-dim);
		transform: translateY(-2px);
	}

	.seasons button.active {
		color: var(--bg);
		background: linear-gradient(135deg, var(--gold), var(--gold-dim));
		border-color: var(--gold);
	}

	.seasons .label {
		font-family: var(--font-display);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.seasons .number {
		font-family: var(--font-display);
		font-size: 1.7rem;
		font-weight: 600;
		line-height: 1.1;
	}

	.seasons .avg {
		font-size: 0.78rem;
		font-variant-numeric: tabular-nums;
	}

	.summary {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem 2.5rem;
		padding: 1.25rem 1.5rem;
		margin-bottom: 1.25rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.summary h2 {
		margin: 0;
		font-size: clamp(1.3rem, 2.5vw, 1.7rem);
		color: var(--gold);
	}

	dl {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2.25rem;
		margin: 0;
	}

	dt {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}

	dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-variant-numeric: tabular-nums;
		color: var(--tier, var(--text));
	}

	small {
		font-size: 0.6em;
		color: var(--muted);
		margin-left: 0.15em;
	}

	.list {
		display: grid;
		gap: 0.6rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.row {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr) 11rem;
		gap: 1.25rem;
		align-items: center;
		padding: 1rem 1.5rem 1rem 1rem;
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-left: 3px solid var(--tier);
		border-radius: var(--radius);
		transition:
			border-color 0.3s var(--ease),
			box-shadow 0.3s var(--ease);
	}

	.row:hover {
		border-color: color-mix(in srgb, var(--tier) 55%, var(--border));
		border-left-color: var(--tier);
		box-shadow: 0 0 24px color-mix(in srgb, var(--tier) 14%, transparent);
	}

	.index {
		font-family: var(--font-display);
		font-size: 1.6rem;
		color: var(--gold-dim);
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	h3 {
		margin: 0;
		font-size: 1.05rem;
		overflow-wrap: anywhere;
	}

	.info p {
		margin: 0;
	}

	.original {
		font-style: italic;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.info .meta {
		margin-top: 0.3rem;
		font-size: 0.8rem;
		color: var(--muted);
	}

	.info .top {
		margin-top: 0.4rem;
		font-family: var(--font-display);
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--tier);
	}

	.score {
		display: grid;
		gap: 0.3rem;
		color: var(--tier);
	}

	.score:hover {
		color: var(--tier);
		filter: brightness(1.15);
	}

	.value {
		font-family: var(--font-display);
		font-size: 1.6rem;
		font-weight: 600;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.bar {
		display: block;
		height: 4px;
		background: var(--ash);
		border-radius: 2px;
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: var(--tier);
	}

	.votes {
		font-size: 0.72rem;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}

	.source {
		margin: 2rem 0 0;
		text-align: center;
		font-size: 0.75rem;
		color: var(--muted);
	}

	@media (max-width: 700px) {
		.seasons {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.summary {
			padding: 1rem;
		}

		dl {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			width: 100%;
		}

		.row {
			grid-template-columns: 2rem minmax(0, 1fr) auto;
			gap: 0.75rem;
			padding: 0.85rem 0.9rem 0.85rem 0.6rem;
		}

		.index {
			font-size: 1.25rem;
		}

		.score {
			min-width: 5.5rem;
			text-align: right;
		}

		.value {
			font-size: 1.3rem;
		}
	}
</style>
