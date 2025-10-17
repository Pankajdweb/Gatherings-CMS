# Webflow Development Project

A Next.js application for managing Webflow collection items with web scraping capabilities.

## Features

- **Collection Management**: View and edit items from Webflow collections
- **Web Scraper**: Scrape grant information from government websites and add to collections
- **Modal Editing**: In-place editing of collection items
- **API Integration**: Full CRUD operations with Webflow API

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/page.tsx` - Main page displaying collection items
- `app/scraper/page.tsx` - Web scraper for grant data
- `app/components/EditItemModal.tsx` - Modal for editing items
- `app/api/collection/` - API routes for collection operations

## API Configuration

The project uses Webflow API v2. Make sure to configure your API keys in the environment variables or update the hardcoded values in the API routes.

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Webflow API v2
