<script lang="ts">
	import type { DataItem } from '$lib';

	let { libraries = [] }: { libraries?: DataItem[] } = $props();

	let sortBy: 'name' | 'language' | 'date' = $state('name');
	let searchQuery = $state('');

	let filtered = $derived(
		libraries
			.filter(
				(lib) =>
					lib.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					lib.Description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(lib.Language?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
			)
			.sort((a, b) => {
				switch (sortBy) {
					case 'language':
						return (a.Language || '').localeCompare(b.Language || '');
					case 'date':
						return new Date(b['Date added']).getTime() - new Date(a['Date added']).getTime();
					case 'name':
					default:
						return a.Name.localeCompare(b.Name);
				}
			})
	);
</script>

<svelte:head>
	<style>
		.container {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}

		.search-box {
			background: white;
			border-radius: 8px;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
			padding: 16px;
		}

		.search-input {
			width: 100%;
			padding: 10px 12px;
			border: 1px solid #d1d5db;
			border-radius: 6px;
			font-size: 14px;
			font-family: inherit;
		}

		.search-input:focus {
			outline: none;
			border-color: #2563eb;
		}

		.filter-options {
			display: flex;
			gap: 24px;
			margin-top: 16px;
			flex-wrap: wrap;
		}

		.filter-label {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 13px;
			color: #4b5563;
			cursor: pointer;
		}

		.filter-label input[type='radio'] {
			cursor: pointer;
		}

		.table-wrapper {
			background: white;
			border-radius: 8px;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
			overflow: hidden;
		}

		.table {
			width: 100%;
			border-collapse: collapse;
		}

		thead {
			background: #f3f4f6;
			border-bottom: 1px solid #e5e7eb;
		}

		th {
			padding: 12px 16px;
			text-align: left;
			font-size: 13px;
			font-weight: 600;
			color: #111827;
		}

		.table-row {
			border-bottom: 1px solid #e5e7eb;
			transition: background-color 0.15s;
		}

		.table-row:hover {
			background-color: #f9fafb;
		}

		td {
			padding: 12px 16px;
			font-size: 13px;
		}

		.language-cell {
			width: 120px;
		}

		.language-badge {
			display: inline-block;
			background: #dbeafe;
			color: #1e40af;
			padding: 4px 8px;
			border-radius: 4px;
			font-size: 12px;
			font-weight: 600;
		}

		.name-cell {
			font-weight: 500;
		}

		.name-cell a {
			color: #2563eb;
			text-decoration: none;
		}

		.name-cell a:hover {
			color: #1d4ed8;
			text-decoration: underline;
		}

		.description-cell {
			color: #4b5563;
		}

		.date-cell {
			color: #6b7280;
			width: 120px;
		}

		.custom-field-cell {
			color: #6b7280;
			font-size: 12px;
		}

		.empty-state {
			padding: 32px;
			text-align: center;
			color: #6b7280;
		}

		.results-count {
			text-align: center;
			font-size: 13px;
			color: #6b7280;
			padding: 8px 0;
		}
	</style>

	<script async defer src="https://buttons.github.io/buttons.js"></script>
</svelte:head>

<div class="container">
	<!-- Search and Filter -->
	<div class="search-box">
		<input
			type="text"
			placeholder="Search by name, language, or description..."
			bind:value={searchQuery}
			class="search-input"
		/>
		<div class="filter-options">
			<label class="filter-label">
				<input type="radio" bind:group={sortBy} value="name" />
				<span>Sort by Name</span>
			</label>
			<label class="filter-label">
				<input type="radio" bind:group={sortBy} value="language" />
				<span>Sort by Language</span>
			</label>
			<label class="filter-label">
				<input type="radio" bind:group={sortBy} value="date" />
				<span>Sort by Date Added</span>
			</label>
		</div>
	</div>

	<!-- Table -->
	<div class="table-wrapper">
		<table class="table">
			<thead>
				<tr>
					<th>Language</th>
					<th>Name</th>
					<th>Description</th>
					<th>Author</th>
					<th>Date Added</th>
					<th>Archived GitHub Repository</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as lib (lib.Link)}
					<tr class="table-row">
						<td class="language-cell">
							<span class="language-badge">{lib.Language}</span>
						</td>
						<td class="name-cell">
							<a href={lib.Link} target="_blank" rel="noopener noreferrer">
								{lib.Name}
							</a>
						</td>
						<td class="description-cell">{lib.Description}</td>
						<td class="custom-field-cell">{lib.Author || ' - '}</td>
						<td class="date-cell">{new Date(lib['Date added']).toLocaleString()}</td>
						<td class="custom-field-cell">
							{#if lib['GitHub repository is archived']}
								Yes
							{:else}
								No
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if filtered.length === 0}
			<div class="empty-state">
				<p>No libraries found matching your search.</p>
			</div>
		{/if}
	</div>

	<div class="results-count">
		Showing {filtered.length} of {libraries.length} libraries
	</div>
</div>
