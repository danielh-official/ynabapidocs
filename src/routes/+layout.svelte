<script lang="ts">
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>YNAB API Integrations</title>
</svelte:head>

{@render children()}

<footer>
	<ul>
		<li>
			<a href="https://www.flaticon.com/free-icons/document" title="document icons" target="_blank"
				>Document icons created by Freepik - Flaticon</a
			>
		</li>
		<li>
			<a href="https://github.com/danielh-official/ynabapidocs" target="_blank">GitHub Repository</a
			>
		</li>
	</ul>
</footer>
