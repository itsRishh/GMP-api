import "dotenv/config";

import express, {
    type Request,
    type Response,
} from "express";

import fs from "fs";
import path from "path";

import { ConvexHttpClient } from "convex/browser";

import { startScheduledScraping } from "../scraper/scraper-ipo";

const app = express();
const PORT = Number(process.env.PORT ?? "3000");
const DATA_FILE = path.join(process.cwd(), "ipos.json");

function resolveConvexConfig() {
  const url = (process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL ?? "").trim();
  const adminKey = (process.env.CONVEX_ADMIN_KEY ?? "").trim();

  return {
    url,
    adminKey,
  };
}

const { url: CONVEX_URL, adminKey: CONVEX_ADMIN_KEY } = resolveConvexConfig();

type IPOCategory = "mainboard" | "sme" | "all";

interface IPO {
  id: number;
  sourceId?: string;
  category?: IPOCategory;
  name: string;
  url: string;
  gmp: string;
  trend: string;
  rating: string;
  sub: string;
  price: string;
  ipoSize: string;
  lot: string;
  open: string;
  close: string;
  boaDate: string;
  listing: string;
  updatedOn: string;
  anchor: string;
  priceBand: string;
  estimatedListing: string;
  listingGain: string;
  ipoDate: string;
  status: string;
  lastUpdated: string;
  createdAt?: number;
  updatedAt?: number;
  isActive?: boolean;
}

interface IPOFileData {
  ipos?: IPO[];
  all?: IPO[];
  mainboard?: IPO[];
  sme?: IPO[];
  lastUpdated?: string;
}

interface IPOResponse {
  success: boolean;
  count: number;
  data: IPO[] | { all: IPO[]; mainboard: IPO[]; sme: IPO[]; lastUpdated?: string };
  lastUpdated?: string;
}

function normalizeIPOData(data: IPOFileData | IPO[] | null | undefined): IPO[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data) {
    return [];
  }

  if (Array.isArray(data.ipos)) {
    return data.ipos;
  }

  if (Array.isArray(data.all)) {
    return data.all;
  }

  return [...(data.mainboard ?? []), ...(data.sme ?? [])];
}

function readLocalIPOData(): IPOFileData | null {
  if (!fs.existsSync(DATA_FILE)) {
    return null;
  }

  try {
    const file = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(file) as IPOFileData;
  } catch (error) {
    console.error("Failed to read local IPO JSON fallback:", error);
    return null;
  }
}

type ConvexHttpClientWithAdminAuth = ConvexHttpClient & {
  setAdminAuth?: (token: string) => void;
};

async function loadIPODataFromConvex(): Promise<IPO[] | null> {
  if (!CONVEX_URL) {
    return null;
  }

  if (CONVEX_ADMIN_KEY && (CONVEX_ADMIN_KEY.startsWith("http://") || CONVEX_ADMIN_KEY.startsWith("https://"))) {
    console.warn(
      "CONVEX_ADMIN_KEY looks like a Convex site URL, not an admin key. Ignoring it; the deployment URL is enough for local/dev reads and public writes."
    );
  }

  try {
    const client = new ConvexHttpClient(CONVEX_URL) as ConvexHttpClientWithAdminAuth;

    if (typeof client.setAdminAuth === "function" && CONVEX_ADMIN_KEY && !CONVEX_ADMIN_KEY.startsWith("http://") && !CONVEX_ADMIN_KEY.startsWith("https://")) {
      client.setAdminAuth(CONVEX_ADMIN_KEY);
    }

    const rows = await client.query("ipoData:getIpoData", {});

    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((row: Record<string, unknown>) => ({
      id: Number(row.id ?? row.sourceId ?? 0),
      sourceId: String(row.sourceId ?? `ipo-${Math.random()}`),
      category: String(row.category ?? "all") as IPOCategory,
      name: String(row.name ?? "-"),
      url: String(row.url ?? ""),
      gmp: String(row.gmp ?? "₹--"),
      trend: String(row.trend ?? "🟡"),
      rating: String(row.rating ?? "-"),
      sub: String(row.sub ?? "-"),
      price: String(row.price ?? "-"),
      ipoSize: String(row.ipoSize ?? "-"),
      lot: String(row.lot ?? "-"),
      open: String(row.open ?? "-"),
      close: String(row.close ?? "-"),
      boaDate: String(row.boaDate ?? "-"),
      listing: String(row.listing ?? "-"),
      updatedOn: String(row.updatedOn ?? row.lastUpdated ?? "-"),
      anchor: String(row.anchor ?? "-"),
      priceBand: String(row.priceBand ?? "-"),
      estimatedListing: String(row.estimatedListing ?? row.priceBand ?? "-"),
      listingGain: String(row.listingGain ?? "0.00%"),
      ipoDate: String(row.ipoDate ?? "-"),
      status: String(row.status ?? "Open"),
      lastUpdated: String(row.lastUpdated ?? new Date().toISOString()),
      createdAt: Number(row.createdAt ?? 0),
      updatedAt: Number(row.updatedAt ?? 0),
      isActive: Boolean(row.isActive ?? true),
    }));
  } catch (error) {
    console.error("Failed to query Convex IPO data:", error);
    return null;
  }
}

function groupIPOData(records: IPO[]): { all: IPO[]; mainboard: IPO[]; sme: IPO[]; lastUpdated?: string } {
  const mainboard = records.filter((ipo) => ipo.category === "mainboard");
  const sme = records.filter((ipo) => ipo.category === "sme");
  const all = records.length > 0 ? records : [...mainboard, ...sme];
  const latestTimestamp = records
    .map((ipo) => new Date(ipo.lastUpdated).getTime())
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0];

  return {
    all,
    mainboard,
    sme,
    lastUpdated: latestTimestamp ? new Date(latestTimestamp).toISOString() : undefined,
  };
}

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV ?? "development",
    source: CONVEX_URL && CONVEX_ADMIN_KEY ? "convex" : "json-fallback",
  });
});

app.get("/api/ipos", async (_req: Request, res: Response<IPOResponse>) => {
  try {
    let records: IPO[] = [];
    let grouped: { all: IPO[]; mainboard: IPO[]; sme: IPO[]; lastUpdated?: string };

    const convexRecords = await loadIPODataFromConvex();

    if (convexRecords && convexRecords.length > 0) {
      records = convexRecords;
    } else {
      const fallback = readLocalIPOData();
      records = normalizeIPOData(fallback);
    }

    grouped = groupIPOData(records);

    const payload = {
      success: true,
      count: records.length,
      data: grouped,
      lastUpdated: grouped.lastUpdated ?? new Date().toISOString(),
    };

    return res.json(payload);
  } catch (error) {
    console.error("Failed to read IPO data:", error);

    return res.status(500).json({
      success: false,
      count: 0,
      data: { all: [], mainboard: [], sme: [] },
    });
  }
});

startScheduledScraping();

app.listen(PORT, () => {
  console.log(`IPO API running on http://localhost:${PORT}`);
  console.log(`Using source: ${CONVEX_URL && CONVEX_ADMIN_KEY ? "Convex" : "JSON fallback"}`);
});