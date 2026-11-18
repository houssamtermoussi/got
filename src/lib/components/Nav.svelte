<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/store';
	import LangSwitch from './LangSwitch.svelte';

	let open = $state(false);

	const links = [
		{ href: '/', key: 'nav.home' },
		{ href: '/personnages', key: 'nav.characters' },
		{ href: '/maisons', key: 'nav.houses' },
		{ href: '/episodes', key: 'nav.episodes' },
		{ href: '/carte', key: 'nav.map' },
		{ href: '/hasard', key: 'nav.wheel' }
	] as const;

	function isActive(href: string) {
		const id = page.route.id ?? '';
		if (href === '/') return id === '/';
		return id === href || id.startsWith(`${href}/`);
	}

	$effect(() => {
		page.url.pathname;
		open = false;
	});
</script>

<header class="nav">
	<div class="inner container">
		<a class="brand" href={resolve('/')} aria-label={$t('brand')}>
			<svg class="crest" viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M8.1 14.8l.4-6.3L5 4.2l4.4 3.4-.8-5.8L11 7.2l1-6.9 1 6.9 2.4-5.4-.8 5.8L19 4.2l-3.5 4.3.4 6.3z"
				/>
				<path d="M4.4 10.4l2.9.9v7.9H4.4z" />
				<path d="M19.6 10.4l-2.9.9v7.9h2.9z" />
				<path d="M8.1 15.7h7.8v3.5H8.1z" />
				<path d="M3.6 20.1h16.8l.9 2.9H2.7z" />
			</svg>
			<span class="name">{$t('brand')}</span>
		</a>

		<button
			class="burger"
			type="button"
			aria-label="Menu"
			aria-expanded={open}
			aria-controls="main-nav"
			onclick={() => (open = !open)}
		>
			<span></span><span></span><span></span>
		</button>

		<nav id="main-nav" class:open>
			{#each links as link}
				<a
					href={resolve(link.href)}
					class:active={isActive(link.href)}
				>
					{$t(link.key)}
				</a>
			{/each}
			<LangSwitch />
		</nav>
	</div>
</header>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		height: var(--nav-h);
		backdrop-filter: blur(12px);
		background: rgba(7, 6, 5, 0.86);
		border-bottom: 1px solid var(--border);
	}

	.inner {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		color: var(--gold);
		font-family: var(--font-display);
		font-size: 1rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.crest {
		width: 1.4rem;
		height: 1.4rem;
		flex-shrink: 0;
		fill: currentColor;
		opacity: 0.85;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 1.4rem;
	}

	nav a {
		font-family: var(--font-display);
		font-size: 0.78rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		position: relative;
	}

	nav a:hover,
	nav a.active {
		color: var(--gold);
	}

	nav a.active::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.45rem;
		height: 1px;
		background: var(--gold);
	}

	.burger {
		display: none;
		width: 2rem;
		height: 1.4rem;
		flex-direction: column;
		justify-content: space-between;
		padding: 0;
	}

	.burger span {
		display: block;
		height: 2px;
		background: var(--gold);
	}

	@media (max-width: 800px) {
		.burger {
			display: flex;
		}

		nav {
			position: fixed;
			inset: var(--nav-h) 0 auto 0;
			flex-direction: column;
			align-items: stretch;
			gap: 0;
			padding: 1rem 1.25rem 1.25rem;
			background: rgba(14, 12, 10, 0.97);
			border-bottom: 1px solid var(--border);
			transform: translateY(-120%);
			opacity: 0;
			pointer-events: none;
			transition:
				transform 0.35s var(--ease),
				opacity 0.35s var(--ease);
		}

		nav.open {
			transform: translateY(0);
			opacity: 1;
			pointer-events: auto;
		}

		nav a {
			padding: 0.85rem 0;
			border-bottom: 1px solid rgba(201, 162, 39, 0.1);
		}

		nav a.active::after {
			display: none;
		}
	}
</style>
