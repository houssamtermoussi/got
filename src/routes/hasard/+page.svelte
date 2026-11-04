<script lang="ts">
	import { resolve } from '$app/paths';
	import CharacterCard from '#lib/components/CharacterCard.svelte';
	import FortuneWheel, { type WheelItem } from '#lib/components/FortuneWheel.svelte';
	import HouseCard from '#lib/components/HouseCard.svelte';
	import Reveal from '#lib/components/Reveal.svelte';
	import { characters, getHouse, houses, type Character, type House } from '#lib/data';
	import { locale, localized, t } from '#lib/i18n/store';

	type Mode = 'characters' | 'houses';

	let mode = $state<Mode>('characters');
	let resultCharacter = $state<Character | null>(null);
	let resultHouse = $state<House | null>(null);

	const characterItems = $derived<WheelItem[]>(
		characters.map((c) => ({
			id: c.id,
			label: localized(c.name, $locale).split(' ')[0] ?? c.id,
			color: c.accent,
			image: c.image
		}))
	);

	const houseItems = $derived<WheelItem[]>(
		houses.map((h) => ({
			id: h.id,
			label: localized(h.name, $locale).replace(/^Maison\s+/i, '').replace(/^House\s+/i, ''),
			color: h.color,
			image: h.sigil
		}))
	);

	const items = $derived(mode === 'characters' ? characterItems : houseItems);

	function setMode(next: Mode) {
		if (mode === next) return;
		mode = next;
		resultCharacter = null;
		resultHouse = null;
	}

	function onSelect(item: WheelItem) {
		if (mode === 'characters') {
			resultCharacter = characters.find((c) => c.id === item.id) ?? null;
			resultHouse = null;
		} else {
			resultHouse = houses.find((h) => h.id === item.id) ?? null;
			resultCharacter = null;
		}
	}
</script>

<svelte:head>
	<title>{$t('wheel.title')} — {$t('brand')}</title>
</svelte:head>

<section class="section">
	<div class="container">
		<Reveal>
			<h1 class="section-title">{$t('wheel.title')}</h1>
			<p class="section-lead">{$t('wheel.lead')}</p>
		</Reveal>

		<Reveal delay={60}>
			<div class="tabs" role="tablist" aria-label={$t('wheel.title')}>
				<button
					type="button"
					role="tab"
					class:active={mode === 'characters'}
					aria-selected={mode === 'characters'}
					onclick={() => setMode('characters')}
				>
					{$t('wheel.tabCharacters')}
				</button>
				<button
					type="button"
					role="tab"
					class:active={mode === 'houses'}
					aria-selected={mode === 'houses'}
					onclick={() => setMode('houses')}
				>
					{$t('wheel.tabHouses')}
				</button>
			</div>
		</Reveal>

		<Reveal delay={100}>
			<div class="layout">
				{#key mode}
					<FortuneWheel
						{items}
						spinLabel={$t('wheel.spin')}
						spinningLabel={$t('wheel.spinning')}
						{onSelect}
					/>
				{/key}

				<div class="result" class:has-result={!!(resultCharacter || resultHouse)}>
					{#if resultCharacter}
						<p class="eyebrow">{$t('wheel.result')}</p>
						<CharacterCard character={resultCharacter} house={getHouse(resultCharacter.houseId)} />
						<a
							class="btn btn-ghost link"
							href={resolve('/personnages/[id]', { id: resultCharacter.id })}
						>
							{$t('wheel.discover')}
						</a>
					{:else if resultHouse}
						<p class="eyebrow">{$t('wheel.result')}</p>
						<HouseCard house={resultHouse} />
						<a
							class="btn btn-ghost link"
							href={resolve('/maisons/[id]', { id: resultHouse.id })}
						>
							{$t('wheel.discover')}
						</a>
					{:else}
						<p class="hint">{$t('wheel.hint')}</p>
					{/if}
				</div>
			</div>
		</Reveal>
	</div>
</section>

<style>
	.tabs {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin: 0 auto 2.5rem;
		padding: 0.35rem;
		width: fit-content;
		max-width: 100%;
		background: rgba(20, 17, 14, 0.75);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}

	.tabs button {
		padding: 0.7rem 1.35rem;
		font-family: var(--font-display);
		font-size: 0.78rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		border-radius: var(--radius);
		transition:
			color 0.25s var(--ease),
			background 0.25s var(--ease);
	}

	.tabs button:hover {
		color: var(--gold);
	}

	.tabs button.active {
		color: var(--bg);
		background: linear-gradient(135deg, var(--gold), var(--gold-dim));
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
		gap: 2.5rem;
		align-items: center;
	}

	.result {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		min-height: 16rem;
		justify-content: center;
		padding: 1.25rem;
		border: 1px dashed rgba(201, 162, 39, 0.22);
		background: rgba(20, 17, 14, 0.35);
		transition:
			border-color 0.35s var(--ease),
			background 0.35s var(--ease);
	}

	.result.has-result {
		border-style: solid;
		border-color: var(--border);
		background: rgba(26, 22, 18, 0.55);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.78rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		text-align: center;
	}

	.hint {
		margin: 0;
		text-align: center;
		color: var(--muted);
		font-style: italic;
		padding: 2rem 1rem;
	}

	.link {
		align-self: center;
	}

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.result {
			min-height: 0;
		}
	}
</style>
