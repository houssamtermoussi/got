<script lang="ts">
	import { t } from '#lib/i18n/store';
</script>

<footer class="footer">
	<div class="container">
		<p>{$t('footer.note')}</p>
	</div>
</footer>

<style>
	.footer {
		margin-top: 4rem;
		padding: 2rem 0 2.5rem;
		border-top: 1px solid var(--border);
		text-align: center;
	}

	p {
		margin: 0;
		color: var(--muted);
		font-size: 0.85rem;
	}
</style>
