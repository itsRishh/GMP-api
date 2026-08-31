import "dotenv/config";

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

import { ConvexHttpClient } from "convex/browser";
import { chromium } from "playwright";

const URL =
  "https://www.investorgain.com/report/ipo-gmp-live/331/";

const SOURCE_BASE_URL = "https://www.investorgain.com";

const OUTPUT_FILE = path.join(process.cwd(), "ipos.json");

function resolveConvexConfig() {
  const url = (process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL ?? "").trim();
  const adminKey = (process.env.CONVEX_ADMIN_KEY ?? "").trim();

  return {
    url,
    adminKey,
  };
}

const { url: CONVEX_URL, adminKey: CONVEX_ADMIN_KEY } = resolveConvexConfig();

export interface IPO {
  id: number;
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
}

export interface IPOData {
  ipos: IPO[];
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeStatus(nameText: string): string {
  const normalized = nameText.replace(/\s+/g, " ").trim();
  const statusCode = normalized.slice(-1).toUpperCase();

  if (statusCode === "U") {
    return "Upcoming";
  }

  if (statusCode === "C") {
    return "Closed";
  }

  if (statusCode === "O") {
    return "Open";
  }

  if (statusCode === "L") {
    return "Listed";
  }

  return "Open";
}

function classifyIPO(name: string): "mainboard" | "sme" | "all" {
  if (/SME|BSE SME|NSE SME/i.test(name)) {
    return "sme";
  }

  return "mainboard";
}

function normalizeForConvex(ipo: IPO, index: number): Record<string, unknown> {
  const category = classifyIPO(ipo.name);
  const sourceId = `${category}-${(ipo.name || "ipo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "ipo"}-${index + 1}`;

  return {
    sourceId,
    category,
    name: ipo.name,
    url: ipo.url,
    gmp: ipo.gmp,
    trend: ipo.trend,
    rating: ipo.rating,
    sub: ipo.sub,
    price: ipo.price,
    ipoSize: ipo.ipoSize,
    lot: ipo.lot,
    open: ipo.open,
    close: ipo.close,
    boaDate: ipo.boaDate,
    listing: ipo.listing,
    updatedOn: ipo.updatedOn,
    anchor: ipo.anchor,
    priceBand: ipo.priceBand,
    estimatedListing: ipo.estimatedListing,
    listingGain: ipo.listingGain,
    ipoDate: ipo.ipoDate,
    status: ipo.status,
    lastUpdated: ipo.lastUpdated || new Date().toISOString(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isActive: true,
  };
}

export async function scrapeIPOData(): Promise<IPO[]> {
  console.log("Opening browser to fetch live Investorgain data...");

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      viewport: { width: 1440, height: 1600 },
    });

    await page.goto(URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForFunction(
      () => {
        const table = document.querySelector("#reportTable");
        if (!table) return false;

        const rows = [...table.querySelectorAll("tbody tr")];
        return rows.some(
          (row) =>
            row.textContent &&
            !row.textContent.toLowerCase().includes("no data available") &&
            row.querySelector("td")
        );
      },
      { timeout: 45000 }
    );

    const rows = await page.$$eval("table#reportTable tbody tr", (elements) =>
      elements
        .filter((row) => {
          const text = (row.textContent ?? "").replace(/\s+/g, " ").trim();
          return Boolean(text) && !text.toLowerCase().includes("no data available");
        })
        .map((row) => {
          const cells = [...row.querySelectorAll("td")].map((cell) =>
            cell.textContent?.replace(/\s+/g, " ").trim() ?? ""
          );
          const link = row.querySelector("a[href]");

          return {
            cells,
            href: link ? link.getAttribute("href") ?? "" : "",
          };
        })
    );

    const ipos: IPO[] = [];

    rows.forEach((row, index) => {
      const cells = row.cells;

      if (cells.length < 13) {
        return;
      }

      const name = cleanText(cells[0] ?? "");

      if (!name || name === "Name") {
        return;
      }

      const gmpCellText = cleanText(cells[1] ?? "");
      const gmpMatch = gmpCellText.match(
        /₹?\s*([0-9]+(?:\.[0-9]+)?)\s*\(([0-9.]+)%\)/i
      );

      const gmpValue = gmpMatch ? gmpMatch[1] : "0";
      const listingGain = gmpMatch ? `${gmpMatch[2]}%` : "0.00%";
      const gmp = gmpMatch ? `₹${gmpValue}` : "₹--";
      const trend = gmpMatch
        ? Number(gmpValue) > 0
          ? "🟢"
          : "🔴"
        : "🟡";

      const priceText = cleanText(cells[4] ?? "");
      const priceValue = Number(priceText.replace(/[^\d.]/g, ""));
      const priceBand = Number.isFinite(priceValue)
        ? `₹${priceValue}`
        : priceText || "₹0";

      const open = cleanText(cells[7] ?? "");
      const close = cleanText(cells[8] ?? "");
      const ipoDate = [open, close].filter(Boolean).join(" - ");
      const status = normalizeStatus(name);
      const lastUpdated = cleanText(cells[11] ?? "");

      const href = row.href || "";
      const fullUrl = href
        ? href.startsWith("http")
          ? href
          : `${SOURCE_BASE_URL}${href}`
        : "";

      ipos.push({
        id: index + 1,
        name,
        url: fullUrl,
        gmp,
        trend,
        rating: cleanText(cells[2] ?? ""),
        sub: cleanText(cells[3] ?? ""),
        price: cleanText(cells[4] ?? ""),
        ipoSize: cleanText(cells[5] ?? ""),
        lot: cleanText(cells[6] ?? ""),
        open,
        close,
        boaDate: cleanText(cells[9] ?? ""),
        listing: cleanText(cells[10] ?? ""),
        updatedOn: cleanText(cells[11] ?? ""),
        anchor: cleanText(cells[12] ?? ""),
        priceBand,
        estimatedListing: priceBand,
        listingGain,
        ipoDate,
        status,
        lastUpdated,
      });
    });

    return ipos;
  } finally {
    await browser.close();
  }
}

export async function saveToJSON(data: IPO[]): Promise<void> {
  const payload: IPOData = { ipos: data };

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(payload, null, 2),
    "utf-8"
  );

  console.log(`Saved ${data.length} IPOs to ipos.json`);
}

type ConvexHttpClientWithAdminAuth = ConvexHttpClient & {
  setAdminAuth?: (token: string) => void;
};

export async function saveToConvex(data: IPO[]): Promise<number> {
  if (!CONVEX_URL) {
    throw new Error(
      "Missing Convex deployment URL. Run npx convex dev or set CONVEX_URL in .env before writing to Convex."
    );
  }

  if (CONVEX_ADMIN_KEY && (CONVEX_ADMIN_KEY.startsWith("http://") || CONVEX_ADMIN_KEY.startsWith("https://"))) {
    console.warn(
      "CONVEX_ADMIN_KEY looks like a Convex site URL, not an admin key. Ignoring it; the deployment URL is enough for local/dev reads and public writes."
    );
  }

  const client = new ConvexHttpClient(CONVEX_URL) as ConvexHttpClientWithAdminAuth;

  if (typeof client.setAdminAuth === "function" && CONVEX_ADMIN_KEY && !CONVEX_ADMIN_KEY.startsWith("http://") && !CONVEX_ADMIN_KEY.startsWith("https://")) {
    client.setAdminAuth(CONVEX_ADMIN_KEY);
  }

  const items = data.map((ipo, index) => normalizeForConvex(ipo, index));

  const result = await client.mutation("ipoData:replaceSnapshot", {
    items,
  });

  console.log(`Saved ${result.count ?? items.length} IPOs to Convex table ipoData`);
  return result.count ?? items.length;
}

export async function refreshIPOData(): Promise<IPO[]> {
  const data = await scrapeIPOData();

  if (data.length === 0) {
    console.log("No IPO data found.");
    return data;
  }

  const convextCount = await saveToConvex(data);

  if (convextCount === 0) {
    await saveToJSON(data);
  } else {
    await saveToJSON(data);
  }

  return data;
}

export function startScheduledScraping(
  intervalMs = 30 * 60 * 1000
): NodeJS.Timeout {
  const run = async () => {
    try {
      await refreshIPOData();
    } catch (error) {
      console.error(
        "Scraping failed:",
        error instanceof Error ? error.message : error
      );
    }
  };

  void run();

  return setInterval(() => {
    void run();
  }, intervalMs);
}

const isDirectScriptRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectScriptRun) {
  startScheduledScraping();
}
