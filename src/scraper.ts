import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
import * as path from 'path';
import type { DataItem } from '$lib';

interface ExistingData {
	items: DataItem[];
}

class YNABScraper {
	private logFile: string;
	private dataFilePath: string;
	private ynabHtmlFilePath: string;
	private baseUrl = 'https://api.ynab.com/';

	constructor() {
		this.logFile = path.join(process.cwd(), 'scraper.log');
		this.dataFilePath = path.join(process.cwd(), 'src', 'data.json');
		// Save fetched YNAB HTML as the root original.html (exact copy)
		this.ynabHtmlFilePath = path.join(process.cwd(), 'original.html');
		this.clearLog();
	}

	private log(message: string): void {
		const timestamp = new Date().toISOString();
		const logMessage = `[${timestamp}] ${message}\n`;
		fs.appendFileSync(this.logFile, logMessage);
		console.log(logMessage);
	}

	private clearLog(): void {
		fs.writeFileSync(this.logFile, '');
	}

	async fetchPage(): Promise<string> {
		try {
			this.log(`Fetching ${this.baseUrl}`);
			const response = await fetch(this.baseUrl);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			const html = await response.text();
			this.log('Page fetched successfully');
			return html;
		} catch (error) {
			this.log(`ERROR fetching page: ${error}`);
			throw error;
		}
	}

	private parseLibraries(html: string): DataItem[] {
		const items: DataItem[] = [];
		try {
			const dom = new JSDOM(html);
			const document = dom.window.document;

			// Find the clients-community section
			const clientsSection = document.getElementById('clients-community');
			if (!clientsSection) {
				this.log('WARNING: Could not find #clients-community section');
				return items;
			}

			// Find the list items within this section
			const listItems = clientsSection.parentElement?.querySelectorAll('li') || [];

			listItems.forEach((li: Element, index: number) => {
				try {
					const text = li.textContent?.trim() || '';
					if (!text) return;

					// Get the anchor tag
					const anchor = li.querySelector('a');
					if (!anchor) {
						this.log(`WARNING: Library item ${index} has no anchor tag: "${text}"`);
						return;
					}

					const link = anchor.href;
					const anchorText = anchor.textContent?.trim() || '';

					// Extract language (text before the first " - ")
					const parts = text.split(' - ');
					let language = '';
					let nameAndRest = text;

					// Language is the part before the first " - "
					if (parts.length >= 2) {
						language = parts[0].trim();
						nameAndRest = parts.slice(1).join(' - ');
					}

					// Name is the anchor text
					const name = anchorText;

					// Description is everything after " - " that comes after the name
					// We need to find the description after the anchor text
					const descriptionMatch = text.match(new RegExp(`${name}\\s+by\\s+(.+?)$`));
					let description = '';

					if (descriptionMatch) {
						description = `by ${descriptionMatch[1]}`;
					} else {
						// Fallback: get everything after the language and dash
						const descriptionStart = text.indexOf(anchorText) + anchorText.length;
						description = text.substring(descriptionStart).trim();
					}

					const item: DataItem = {
						Text: text,
						'Date added': new Date().toISOString(),
						Name: name,
						Description: description,
						Type: 'library',
						Language: language,
						Link: link
					};

					items.push(item);
					this.log(`Parsed library: ${name} (${language})`);
				} catch (error) {
					this.log(`ERROR parsing library item ${index}: ${error}`);
				}
			});
		} catch (error) {
			this.log(`ERROR parsing libraries section: ${error}`);
		}

		return items;
	}

	private parseWorksWithYNAB(html: string): DataItem[] {
		const items: DataItem[] = [];
		try {
			const dom = new JSDOM(html);
			const document = dom.window.document;

			// Find the works-with-ynab section
			const worksSection = document.getElementById('works-with-ynab-third-party');
			if (!worksSection) {
				this.log('WARNING: Could not find #works-with-ynab-third-party section');
				return items;
			}

			// Find the list items within this section
			const listItems = worksSection.parentElement?.querySelectorAll('li') || [];

			listItems.forEach((li: Element, index: number) => {
				try {
					const text = li.textContent?.trim() || '';
					if (!text) return;

					// Get the anchor tag
					const anchor = li.querySelector('a');
					if (!anchor) {
						this.log(`WARNING: Works with YNAB item ${index} has no anchor tag: "${text}"`);
						return;
					}

					const link = anchor.href;
					const anchorText = anchor.textContent?.trim() || '';

					// For works_with_ynab items, the structure is: <a>Name</a> - Description
					const parts = text.split(' - ');
					const name = anchorText;
					const description = parts.slice(1).join(' - ').trim();

					const item: DataItem = {
						Text: text,
						'Date added': new Date().toISOString(),
						Name: name,
						Description: description,
						Type: 'works_with_ynab',
						Language: null,
						Link: link
					};

					items.push(item);
					this.log(`Parsed works_with_ynab: ${name}`);
				} catch (error) {
					this.log(`ERROR parsing works_with_ynab item ${index}: ${error}`);
				}
			});
		} catch (error) {
			this.log(`ERROR parsing works_with_ynab section: ${error}`);
		}

		return items;
	}

	private loadExistingData(): DataItem[] {
		try {
			if (fs.existsSync(this.dataFilePath)) {
				const content = fs.readFileSync(this.dataFilePath, 'utf-8');
				const data = JSON.parse(content) as ExistingData;
				this.log(`Loaded ${data.items.length} existing items from data.json`);
				return data.items;
			}
		} catch (error) {
			this.log(`WARNING: Could not load existing data.json: ${error}`);
		}
		return [];
	}

	private mergeItems(existingItems: DataItem[], newItems: DataItem[]): DataItem[] {
		const merged = [...existingItems];

		// Create a map of existing items by Name + Link
		const existingMap = new Map<string, number>();
		existingItems.forEach((item, index) => {
			const key = `${item.Name}||${item.Link}`;
			existingMap.set(key, index);
		});

		// Process new items
		newItems.forEach((newItem) => {
			const key = `${newItem.Name}||${newItem.Link}`;
			const existingIndex = existingMap.get(key);

			if (existingIndex !== undefined) {
				// Update existing item but preserve original "Date added"
				merged[existingIndex] = {
					...newItem,
					'Date added': merged[existingIndex]['Date added']
				};
				this.log(`Updated existing item: ${newItem.Name}`);
			} else {
				// Add new item
				merged.push(newItem);
				this.log(`Added new item: ${newItem.Name}`);
			}
		});

		return merged;
	}

	private saveData(items: DataItem[]): void {
		try {
			const data: ExistingData = { items };
			fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
			this.log(`Saved ${items.length} items to data.json`);
		} catch (error) {
			this.log(`ERROR saving data.json: ${error}`);
			throw error;
		}
	}

	private saveYNABHTML(html: string): void {
		try {
			fs.writeFileSync(this.ynabHtmlFilePath, html);
			this.log(`Saved YNAB API HTML to original.html`);
		} catch (error) {
			this.log(`ERROR saving original.html: ${error}`);
			throw error;
		}
	}

	async run(): Promise<void> {
		try {
			this.log('=== YNAB API Scraper Started ===');

			// Fetch the page
			const html = await this.fetchPage();

			// Save the original YNAB HTML
			this.saveYNABHTML(html);

			// Parse libraries and works_with_ynab
			const libraries = this.parseLibraries(html);
			const worksWithYNAB = this.parseWorksWithYNAB(html);

			this.log(`Parsed ${libraries.length} libraries`);
			this.log(`Parsed ${worksWithYNAB.length} works_with_ynab items`);

			// Combine all new items
			const newItems = [...libraries, ...worksWithYNAB];

			// Load existing data
			const existingItems = this.loadExistingData();

			// Merge items
			const mergedItems = this.mergeItems(existingItems, newItems);

			// Save data
			this.saveData(mergedItems);

			this.log('=== YNAB API Scraper Completed Successfully ===');
		} catch (error) {
			this.log(`=== YNAB API Scraper Failed: ${error} ===`);
			process.exit(1);
		}
	}
}

// Run the scraper
const scraper = new YNABScraper();
scraper.run();
