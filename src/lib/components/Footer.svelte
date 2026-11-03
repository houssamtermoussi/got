<script lang="ts">
	import { t } from '#lib/i18n/store';
</script>

<footer class="footer">
	<div class="container">
		<p>{$t('footer.note')}</p>
		<p class="credit">
			<a
				href="https://commons.wikimedia.org/wiki/File:Pozna%C5%84_Pyrkon_2015_Game_of_Thrones_The_Throne.JPG"
				target="_blank"
				rel="noopener noreferrer">{$t('footer.throneCredit')}</a
			>
			—
			<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer"
				>CC BY-SA 4.0</a
			>
		</p>
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

	.credit {
		margin-top: 0.5rem;
		font-size: 0.72rem;
	}

	.credit a {
		color: var(--muted);
		text-decoration: underline;
		text-decoration-color: var(--border);
	}
</style>
