# IPO GMP Watch

IPO GMP Watch is a React + TypeScript dashboard for tracking Indian IPO grey market premium data. The app reads IPO data from a local JSON file served by an Express API and displays it in a live-looking table with summary stats.

## Features

- Dashboard with IPO summary cards
- Searchable and sortable IPO table
- Data fetched from a local API endpoint
- Scraper to refresh market data from the source website
- Vite frontend with proxy to the backend API

## Tech stack

- React 19 + TypeScript + Vite
- Express API server
- Axios + Cheerio for scraping IPO market data
- Tailwind CSS for UI styling

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or newer
- npm 9 or newer

## Project setup

1. Open a terminal in the project root.
2. Install dependencies:

```bash
npm install
```

3. Fetch the latest IPO data so the API has a source file to serve:

```bash
npm run scrape
```

This creates or refreshes the file `ipos.json` in the project root.

## Run the app

You need two processes running at the same time:

### 1) Start the API server

```bash
npm run api
```

This starts the Express API on:

- http://localhost:3000/api/ipos

### 2) Start the frontend

Open a second terminal and run:

```bash
npm run dev
```

Then open:

- http://localhost:5173

The Vite app is configured to proxy `/api` requests to the local Express server.

## Build for production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Deploy to Vercel

This project can be deployed to Vercel as a frontend-only app. Since the scraper and local API are part of the project, Vercel deployment needs one small adjustment: the API should be moved to a serverless function or hosted elsewhere.

### Recommended Vercel setup

Use Vercel for the frontend only, and keep the Express API running on a separate host or serverless environment if you want live scraped data in production.

### 1) Push the project to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2) Import the project in Vercel

1. Open https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Set the project root to the repository root
5. Keep the default Vercel settings for a Vite app

### 3) Framework settings

Vercel should detect Vite automatically. The build command is:

```bash
npm run build
```

The output directory is:

```bash
dist
```

### 4) Configure environment variables

If you later move the API to Vercel Serverless Functions, add any required variables here.

For the current local setup, no special environment variables are required.

### 5) Important note about the scraper and API

The app currently depends on:

- a local Express API on port 3000
- a local scraper that writes `ipos.json`

Vercel does not run a long-lived local Express server the same way as your machine does. For production deployment, the recommended approach is:

- deploy the frontend to Vercel
- host the API separately, or
- convert the API into Vercel serverless routes
- keep the scraper as a scheduled job or server process that updates the JSON file before the app is served

### Example serverless API pattern

If you want to keep everything on Vercel, move the logic from `server/server.ts` into a route such as:

```ts
// api/ipos.ts
export default function handler(req, res) {
  res.status(200).json({ success: true, data: [] });
}
```

Then fetch from the Vercel route instead of `http://localhost:3000/api/ipos`.

### Static deployment summary

For the simplest deployment:

```bash
npm install
npm run build
```

Then upload the `dist` folder to Vercel or connect the repo to Vercel.

## Project structure

```text
.
├── server/
│   └── server.ts        # Express API that serves ipos.json
├── scraper/
│   └── scraper-ipo.ts   # Scrapes the latest IPO data from the source website
├── src/
│   ├── App.tsx          # Main dashboard layout
│   ├── components/      # UI components
│   └── types/           # Type definitions
├── ipos.json            # Fetched IPO data used by the API
├── package.json         # Scripts and dependencies
├── vite.config.ts       # Vite config with API proxy
├── index.html
└── README.md
```

## Troubleshooting

### API returns 404 or empty data

Make sure the `ipos.json` file exists and the API server is running.

```bash
npm run scrape
npm run api
```

### Frontend cannot load IPO data

Confirm both processes are running and that the Vite dev server can reach the API on port 3000.

### Build fails on a case-sensitive system

The project uses a file named `stats.tsx`. If you see a case mismatch during build, make sure imports match the file name exactly:

```ts
import Stats from "./components/stats";
```

## Notes

- Market data is scraped from a public source and may sometimes change format.
- The app is intended for local development and dashboard viewing, not as a production-grade financial data platform.

