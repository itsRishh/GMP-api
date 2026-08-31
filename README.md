# IPO GMP Watch

IPO GMP Watch is a React + TypeScript dashboard for tracking Indian IPO grey market premium data. The app scrapes the live Investorgain IPO table, stores the latest snapshot in Convex, serves it through an Express API, and displays it in a live dashboard.

## Production architecture

The project now follows this flow:

```text
scraper -> Convex -> Express API -> React frontend
```

The scraper refreshes the source table every 30 minutes, writes the normalized snapshot to Convex, and the API reads from Convex instead of a local JSON file. The frontend continues to receive the same response shape expected by the current dashboard.

## Features

- Dashboard with IPO summary cards
- Full IPO table and live GMP display
- 30-minute automated scrape refresh
- Convex-backed persistent storage
- Render-ready Express server with `/health` endpoint
- Frontend debug timestamp showing when data was last refreshed

## Tech stack

- React 19 + TypeScript + Vite
- Express API server
- Playwright-based scraping from Investorgain
- Convex for persistence and snapshot storage
- Tailwind CSS for styling

## Prerequisites

Before running locally, make sure you have:

- Node.js 18 or newer
- npm 9 or newer
- A Convex deployment URL and admin key for production use

## Local development setup

1. Install dependencies:

```bash
npm install
```

2. Create the environment file:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
PORT=3000
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_ADMIN_KEY=your-admin-key
```

3. Start the API:

```bash
npm run api
```

This runs the Express server and exposes:

- `http://localhost:3000/api/ipos`
- `http://localhost:3000/health`

4. Start the frontend in a second terminal:

```bash
npm run dev
```

Then open:

- `http://localhost:5173`

5. Run the scraper manually if you want to refresh data immediately:

```bash
npm run scrape
```

## Production deployment on Render

### 1) Create a Convex project

1. Go to https://convex.dev
2. Create a new project
3. Copy the deployment URL, for example:

```text
https://happy-otter-123.convex.cloud
```

4. Copy the admin key from the Convex dashboard
5. Add these values to your Render service environment variables

### 2) Prepare the repository

The project already includes:

- `convex/schema.ts`
- `convex/ipoData.ts`
- `render.yaml`
- `.env.example`

Deploy the backend and frontend as a single web service on Render, with the server reading from Convex at runtime.

### 3) Add environment variables in Render

Set these values in the Render dashboard:

```env
NODE_ENV=production
PORT=3000
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_ADMIN_KEY=your-admin-key
```

### 4) Build and start commands

Use these values in Render:

```bash
npm install && npm run build
npm run start
```

The service health check path is:

```text
/health
```

### 5) Deploy the Convex backend

After the app is connected to your Convex deployment, deploy the schema and functions with the Convex CLI:

```bash
npx convex dev
```

or in production:

```bash
npx convex deploy
```

This ensures the `ipoData` table and the `getIpoData` query exist before the app starts reading from Convex.

## Render service behavior

The app is designed to work in production as follows:

- Express server starts on the Render-assigned port
- `/health` returns a 200 status for health checks
- `/api/ipos` loads the latest IPO data from Convex
- if Convex is not configured, it falls back to the local `ipos.json` file
- scraper runs on a timer and refreshes Convex with the latest live source data

## Build for production

```bash
npm run build
```

To preview the frontend locally:

```bash
npm run preview
```

## Project structure

```text
.
├── convex/
│   ├── schema.ts          # Convex data model
│   └── ipoData.ts        # Queries and mutations for IPO snapshots
├── server/
│   └── server.ts         # Express API and health route
├── scraper/
│   └── scraper-ipo.ts    # Scrapes the live IPO table and refreshes Convex
├── src/
│   ├── App.tsx           # Main dashboard layout
│   ├── components/       # UI components
│   └── types/            # Type definitions
├── .env.example          # Environment template
├── render.yaml           # Render configuration
├── ipos.json             # Local fallback snapshot
├── package.json          # Scripts and dependencies
├── vite.config.ts        # Vite config with API proxy
├── index.html
├── README.md
└── .gitignore
```

## Troubleshooting

### API returns empty data

Check that:

```bash
npm run api
```

and that the `CONVEX_URL` and `CONVEX_ADMIN_KEY` values are correct if using the production setup.

### Convex data is not loading

Verify the schema is deployed and the `ipoData` table exists:

```bash
npx convex deploy
```

### Frontend cannot load IPO data

Confirm that both the frontend and backend are running, and that the API can return a valid response from `/api/ipos`.

## Notes

- Market data is scraped from a public source and may change format over time.
- The scraper is set to refresh every 30 minutes by default.
- `ipos.json` remains as a local fallback while Convex is the primary persistent store for production.

