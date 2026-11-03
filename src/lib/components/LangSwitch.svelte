<script lang="ts">
	import { locale, setLocale, type Locale } from '#lib/i18n/store';

	const options: Locale[] = ['fr', 'en'];
</script>

<div class="lang" role="group" aria-label="Language">
	{#each options as opt}
		<button
			type="button"
			class:active={$locale === opt}
			onclick={() => setLocale(opt)}
			aria-pressed={$locale === opt}
		>
			{opt.toUpperCase()}
		</button>
	{/each}
</div>

<style>
	.lang {
		display: inline-flex;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	button {
		padding: 0.35rem 0.65rem;
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		color: var(--muted);
		transition:
			color 0.2s var(--ease),
			background 0.2s var(--ease);
	}

	button:hover {
		color: var(--gold);
	}

	button.active {
		color: var(--bg);
		background: var(--gold);
	}
</style>
