<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let {
		children,
		delay = 0
	}: {
		children: Snippet;
		delay?: number;
	} = $props();

	let el: HTMLElement | undefined = $state();

	onMount(() => {
		if (!el) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) {
			el.classList.add('is-visible');
			return;
		}

		el.style.transitionDelay = `${delay}ms`;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						el?.classList.add('is-visible');
						observer.disconnect();
					}
				}
			},
			{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<div class="reveal" bind:this={el}>
	{@render children()}
</div>
