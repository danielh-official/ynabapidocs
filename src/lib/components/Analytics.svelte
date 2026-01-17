<script lang="ts">
	interface DataItem {
		Text: string;
		'Date added': string;
		Name: string;
		Description: string;
		Type: 'library' | 'works_with_ynab';
		Language: string | null;
		Link: string;
	}

	let {
		items = [],
		libraries = [],
		worksWithYNAB = []
	}: { items?: DataItem[]; libraries?: DataItem[]; worksWithYNAB?: DataItem[] } = $props();

	let languageCounts = $derived(
		libraries.reduce(
			(acc, lib) => {
				const lang = lib.Language || 'Unknown';
				acc[lang] = (acc[lang] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		)
	);

	let sortedLanguages = $derived(Object.entries(languageCounts).sort((a, b) => b[1] - a[1]));

	let oldestItem = $derived(
		items.length > 0
			? items.reduce((oldest, current) =>
					new Date(current['Date added']) < new Date(oldest['Date added']) ? current : oldest
				)
			: null
	);

	let newestItem = $derived(
		items.length > 0
			? items.reduce((newest, current) =>
					new Date(current['Date added']) > new Date(newest['Date added']) ? current : newest
				)
			: null
	);

	let monthlyAdditions = $derived(
		items.reduce(
			(acc, item) => {
				const date = new Date(item['Date added']);
				const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
				acc[yearMonth] = (acc[yearMonth] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		)
	);

	let sortedMonths = $derived(Object.entries(monthlyAdditions).sort());
	let maxMonthCount = $derived(Math.max(...Object.values(monthlyAdditions), 1));
</script>

<div class="analytics-container">
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-label">Total Integrations</div>
			<div class="stat-value">{items.length}</div>
		</div>
		<div class="stat-card">
			<div class="stat-label">Community Libraries</div>
			<div class="stat-value">{libraries.length}</div>
		</div>
		<div class="stat-card">
			<div class="stat-label">Works with YNAB</div>
			<div class="stat-value">{worksWithYNAB.length}</div>
		</div>
		<div class="stat-card">
			<div class="stat-label">Programming Languages</div>
			<div class="stat-value">{sortedLanguages.length}</div>
		</div>
	</div>

	<div class="section">
		<h2>Libraries by Language</h2>
		<div class="chart">
			{#each sortedLanguages as [language, count]}
				<div class="chart-row">
					<div class="language-label">{language}</div>
					<div class="bar-container">
						<div
							class="bar"
							style="width: {(count / Math.max(...Object.values(languageCounts))) * 100}%"
						>
							<span class="count">{count}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="section">
		<h2>Timeline</h2>
		<div class="timeline">
			{#if oldestItem}
				<div class="timeline-item">
					<div class="timeline-label">Oldest Entry</div>
					<div class="timeline-content">
						<strong>{oldestItem.Name}</strong>
						<div class="timeline-date">
							{new Date(oldestItem['Date added']).toLocaleString()}
						</div>
					</div>
				</div>
			{/if}
			{#if newestItem}
				<div class="timeline-item">
					<div class="timeline-label">Newest Entry</div>
					<div class="timeline-content">
						<strong>{newestItem.Name}</strong>
						<div class="timeline-date">
							{new Date(newestItem['Date added']).toLocaleString()}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="section">
		<h2>Monthly Additions</h2>
		<div class="monthly-chart">
			{#each sortedMonths as [month, count]}
				<div class="month-item">
					<div class="month-label">{month}</div>
					<div class="month-bar" style="height: {Math.max(20, (count / maxMonthCount) * 200)}px">
						<span class="month-count">{count}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.analytics-container {
		width: 100%;
		max-width: 1200px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
		margin-bottom: 40px;
	}

	.stat-card {
		background: white;
		padding: 24px;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.stat-label {
		font-size: 14px;
		color: #666;
		margin-bottom: 12px;
		font-weight: 500;
	}

	.stat-value {
		font-size: 32px;
		font-weight: bold;
		color: #1e40af;
	}

	.section {
		background: white;
		padding: 24px;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 24px;
	}

	.section h2 {
		margin-top: 0;
		color: #1f2937;
		font-size: 20px;
		margin-bottom: 20px;
	}

	.chart {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.chart-row {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.language-label {
		min-width: 80px;
		font-weight: 500;
		color: #374151;
		font-size: 14px;
	}

	.bar-container {
		flex: 1;
		background: #e5e7eb;
		border-radius: 4px;
		height: 24px;
		overflow: hidden;
	}

	.bar {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #2563eb);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 8px;
		min-width: 30px;
	}

	.count {
		color: white;
		font-size: 12px;
		font-weight: bold;
	}

	.timeline {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 24px;
	}

	.timeline-item {
		padding: 16px;
		border-left: 4px solid #3b82f6;
		background: #f3f4f6;
		border-radius: 4px;
	}

	.timeline-label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.timeline-content {
		font-size: 14px;
	}

	.timeline-content strong {
		display: block;
		color: #1f2937;
		margin-bottom: 4px;
	}

	.timeline-date {
		color: #6b7280;
		font-size: 12px;
	}

	.monthly-chart {
		display: flex;
		align-items: flex-end;
		justify-content: space-around;
		gap: 12px;
		min-height: 250px;
		padding: 20px 0;
	}

	.month-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		flex: 1;
		max-width: 60px;
	}

	.month-bar {
		width: 100%;
		background: linear-gradient(180deg, #3b82f6, #2563eb);
		border-radius: 4px 4px 0 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 4px;
		position: relative;
	}

	.month-count {
		color: white;
		font-size: 11px;
		font-weight: bold;
	}

	.month-label {
		font-size: 11px;
		color: #6b7280;
		text-align: center;
		width: 100%;
	}
</style>
