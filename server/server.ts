import express, {
    type Request,
    type Response,
} from "express";

import fs from "fs";
import path from "path";

import { startScheduledScraping } from "../scraper/scraper-ipo";

const app = express();

const PORT = 3000;

const DATA_FILE = path.join(process.cwd(), "ipos.json");

interface IPO {
  id: number;
  name: string;
  url: string;
  gmp: string;
  trend: string;
  priceBand: string;
  estimatedListing: string;
  listingGain: string;
  ipoDate: string;
  status: string;
  lastUpdated: string;
}

interface IPOFileData {
  ipos?: IPO[];
  all?: IPO[];
  mainboard?: IPO[];
  sme?: IPO[];
}

interface IPOResponse {
  success: boolean;
  count: number;
  data: IPO[];
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

app.get("/api/ipos", (_req: Request, res: Response<IPOResponse>) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({
        success: false,
        count: 0,
        data: [],
      });
    }

    const file = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(file) as IPOFileData | IPO[] | null;
    const normalized = normalizeIPOData(parsed);

    return res.json({
      success: true,
      count: normalized.length,
      data: normalized,
    });
  } catch (error) {
    console.error("Failed to read IPO data:", error);

    return res.status(500).json({
      success: false,
      count: 0,
      data: [],
    });
  }
});

startScheduledScraping();

app.listen(PORT, () => {
  console.log(`IPO API running on http://localhost:${PORT}`);
});