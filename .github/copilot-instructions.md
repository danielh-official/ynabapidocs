# Copilot Instructions for YNAB API Docs

## Overview
This project is a Svelte application designed to integrate with the YNAB API Documentation. It includes a scraper for fetching data from the YNAB API docs website and presents it in a user-friendly format. The architecture is modular, with clear separation between components, routes, and data handling.

## Project Structure
- **src/**: Contains the main application code.
  - **routes/**: Defines the application's routes and layout.
  - **lib/**: Contains reusable components and assets.
  - **scraper.ts**: Implements the logic for fetching and parsing data from the YNAB API Documentation.

## Key Components
- **Layout Component**: The layout is defined in `src/routes/+layout.svelte`, which sets up the page structure and includes a favicon.
- **Scraper**: The `YNABScraper` class in `src/scraper.ts` handles data fetching and logging. It uses `node-fetch` for HTTP requests and `jsdom` for parsing HTML.

## Developer Workflows
- **Development**: Start the development server with `npm run dev`. This command compiles the application and serves it locally.
- **Building**: Create a production build using `npm run build`. Preview the build with `npm run preview`.
- **Logging**: The scraper logs its activities to `scraper.log`, which can be useful for debugging.

## Integration Points
- **Data Fetching**: The scraper fetches data from the YNAB API and saves it in `data.json`. Ensure the API key is set in the environment.
- **Component Communication**: Components communicate through props and context, allowing for a flexible architecture.

## Patterns and Conventions
- **TypeScript**: The project uses TypeScript for type safety. Ensure to follow TypeScript conventions when adding new features.
- **Svelte Conventions**: Follow Svelte's best practices for component structure and state management.

## External Dependencies
- **node-fetch**: Used for making HTTP requests.
- **jsdom**: Used for parsing HTML responses.

## Examples
- To fetch data, instantiate the `YNABScraper` class and call `fetchPage()`. Handle errors appropriately to ensure robust data handling.

## Conclusion
These instructions should help AI agents understand the structure and workflows of the YNAB API Docs project. For any unclear sections, please provide feedback for further refinement.