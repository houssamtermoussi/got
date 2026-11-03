<script lang="ts">
	import { page } from '$app/state';
	import { t } from '#lib/i18n/store';
	import LangSwitch from './LangSwitch.svelte';

	let open = $state(false);

	const links = [
		{ href: '/', key: 'nav.home' },
		{ href: '/personnages', key: 'nav.characters' },
		{ href: '/maisons', key: 'nav.houses' },
		{ href: '/carte', key: 'nav.map' }
	] as const;

	function isActive(href: string, pathname: string) {
		if (href === '/') return pathname === '/';
		return pathname.startsWith(href);
	}

	$effect(() => {
		page.url.pathname;
		open = false;
	});
</script>

<header class="nav">
	<div class="inner container">
		<a class="brand" href="/" aria-label={$t('brand')}>
			<span class="crest" aria-hidden="true">⚔</span>
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
					href={link.href}
					class:active={isActive(link.href, page.url.pathname)}
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
		background: rgba(11, 10, 9, 0.82);
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
		font-size: 1.1rem;
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
