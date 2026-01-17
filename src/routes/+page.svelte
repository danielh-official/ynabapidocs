<script lang="ts">
	import { onMount } from 'svelte';
	import LibrariesTable from '$lib/components/LibrariesTable.svelte';
	import WorksWithYNABTable from '$lib/components/WorksWithYNABTable.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import '$lib/app.css';
	import data from '../data.json';
	import type { DataItem } from '$lib';

	let items: DataItem[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);
	let activeTab: 'libraries' | 'works_with_ynab' | 'analytics' = $state('libraries');

	onMount(() => {
		try {
			items = (data.items || []) as DataItem[];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred';
		} finally {
			loading = false;
		}
	});

	let libraries = $derived(items.filter((item) => item.Type === 'library'));
	let worksWithYNAB = $derived(items.filter((item) => item.Type === 'works_with_ynab'));
</script>

<div class="app">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<h1>YNAB API Integrations</h1>
			<p>Explore community libraries and third-party integrations for YNAB</p>
			<p class="disclaimer">
				DISCLAIMER: This site is <strong>NOT</strong> an official YNAB product. We are not affiliated,
				associated, or in any way officially connected with YNAB or any of its subsidiaries or affiliates.
				The official YNAB website can be found at https://www.ynab.com. The names YNAB and You Need A
				Budget, as well as related names, tradenames, marks, trademarks, emblems, and images are registered
				trademarks of YNAB.
			</p>
		</div>
	</header>

	<!-- Main Content -->
	<main class="main-content">
		{#if loading}
			<div class="loading-message">
				<p>Loading data...</p>
			</div>
		{:else if error}
			<div class="error-message">
				<p>Error: {error}</p>
			</div>
		{:else}
			<!-- Tabs -->
			<div class="tabs">
				<button
					class="tab-button {activeTab === 'libraries' ? 'active' : ''}"
					onclick={() => (activeTab = 'libraries')}
				>
					Community Libraries ({libraries.length})
				</button>
				<button
					class="tab-button {activeTab === 'works_with_ynab' ? 'active' : ''}"
					onclick={() => (activeTab = 'works_with_ynab')}
				>
					Works with YNAB ({worksWithYNAB.length})
				</button>
				<button
					class="tab-button {activeTab === 'analytics' ? 'active' : ''}"
					onclick={() => (activeTab = 'analytics')}
				>
					Analytics
				</button>
			</div>

			<!-- Content -->
			{#if activeTab === 'libraries'}
				<LibrariesTable {libraries} />
			{:else if activeTab === 'works_with_ynab'}
				<WorksWithYNABTable {worksWithYNAB} />
			{:else if activeTab === 'analytics'}
				<Analytics {items} {libraries} {worksWithYNAB} />
			{/if}
		{/if}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
			sans-serif;
		background-color: #f5f5f5;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.header {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		padding: 32px 16px;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.header h1 {
		margin: 0 0 8px 0;
		font-size: 32px;
		font-weight: bold;
		color: #111827;
	}

	.header p {
		margin: 0;
		color: #666;
		font-size: 16px;
	}

	.header .disclaimer {
		font-style: italic;
		color: #888;
		margin-top: 50px;
	}

	.main-content {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		padding: 32px 16px;
	}

	.loading-message,
	.error-message {
		background: white;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		padding: 32px;
		text-align: center;
	}

	.error-message {
		background: #fee2e2;
		border: 1px solid #fca5a5;
	}

	.error-message p {
		color: #991b1b;
	}

	.tabs {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		border-bottom: 1px solid #e5e7eb;
	}

	.tab-button {
		padding: 12px 16px;
		font-size: 14px;
		font-weight: 500;
		background: none;
		border: none;
		border-bottom: 3px solid transparent;
		cursor: pointer;
		transition: all 0.2s;
		color: #6b7280;
	}

	.tab-button:hover {
		color: #111827;
	}

	.tab-button.active {
		color: #2563eb;
		border-bottom-color: #2563eb;
	}
</style>
