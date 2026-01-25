// place files you want to import through the `$lib` alias in this folder.
export interface DataItem {
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
	'GitHub repository is archived'?: boolean | null;
}
