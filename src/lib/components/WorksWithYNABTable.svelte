<script lang="ts">
	interface DataItem {
		Text: string;
		'Date added': string;
		Name: string;
		Description: string;
		Type: 'library' | 'works_with_ynab';
		Language: string | null;
		Link: string;
		// Custom fields (manually added, may be more outdated than scraped fields)
		Author?: string | null;
		GitHub?: string | null;
		Platforms?: string[] | null;
	}

	let { worksWithYNAB = [] }: { worksWithYNAB?: DataItem[] } = $props();

	let searchQuery = $state('');
	let sortBy: 'name' | 'date' = $state('name');

	let filtered = $derived(
		worksWithYNAB
			.filter(
				(app) =>
					app.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					app.Description.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.sort((a, b) => {
				switch (sortBy) {
					case 'date':
						return new Date(b['Date added']).getTime() - new Date(a['Date added']).getTime();
					case 'name':
					default:
						return a.Name.localeCompare(b.Name);
				}
			})
	);
</script>

<div class="container">
	<!-- Search and Filter -->
	<div class="search-box">
		<input
			type="text"
			placeholder="Search by name or description..."
			bind:value={searchQuery}
			class="search-input"
		/>
		<div class="filter-options">
			<label class="filter-label">
				<input type="radio" bind:group={sortBy} value="name" />
				<span>Sort by Name</span>
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
					<th>Name</th>
					<th>Description</th>
					<th>Author</th>
					<th>GitHub</th>
					<th>Platforms</th>
					<th>Date Added</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as app (app.Link)}
					<tr class="table-row">
						<td class="name-cell">
							<a href={app.Link} target="_blank" rel="noopener noreferrer">
								{app.Name}
							</a>
						</td>
						<td class="description-cell">{app.Description}</td>
						<td class="custom-field-cell">{app.Author || ' - '}</td>
						<td class="custom-field-cell">
							{#if app.GitHub}
								<a href={app.GitHub} target="_blank" rel="noopener noreferrer">
									Link
								</a>
							{:else}
								 - 
							{/if}
						</td>
						<td class="custom-field-cell">{app.Platforms ? app.Platforms.join(', ') : ' - '}</td>
						<td class="date-cell">{new Date(app['Date added']).toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if filtered.length === 0}
			<div class="empty-state">
				<p>No apps found matching your search.</p>
			</div>
		{/if}
	</div>

	<div class="results-count">
		Showing {filtered.length} of {worksWithYNAB.length} apps
	</div>
</div>

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
		ring: 2px #2563eb;
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

	.custom-field-cell a {
		color: #2563eb;
		text-decoration: none;
	}

	.custom-field-cell a:hover {
		color: #1d4ed8;
		text-decoration: underline;
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
