import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

const URL =
  "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/";

const OUTPUT_FILE = path.join(
  process.cwd(),
  "ipos.json"
);

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

async function scrapeIPOData(): Promise<IPO[]> {
  console.log("Fetching IPO data...");

  const { data: html } = await axios.get<string>(
    URL,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",

        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },

      timeout: 15000,
    }
  );

  const $ = cheerio.load(html);

  const ipoData: IPO[] = [];

  $("table tbody tr").each((index, row) => {
    const cells = $(row).find("td");

    if (cells.length < 8) {
      return;
    }

    const ipoUrl =
      $(cells[0]).find("a").attr("href") || "";

    const ipoName = $(cells[0])
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const gmp = $(cells[1])
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const trend = $(cells[2])
      .text()
      .trim();

    const priceBand = $(cells[3])
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const estimatedListingRaw = $(cells[4])
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const ipoDate = $(cells[5])
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const status = $(cells[6])
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const lastUpdated = $(cells[7])
      .text()
      .replace(/\s+/g, " ")
      .trim();

    /*
     * Example:
     *
     * ₹224 (26.55%)
     *
     * becomes:
     *
     * estimatedListing: ₹224
     * listingGain: 26.55%
     */

    const listingMatch =
      estimatedListingRaw.match(
        /₹([\d,]+)\s*\(([\d.]+)%\)/
      );

    const estimatedListing = listingMatch
      ? `₹${listingMatch[1]}`
      : estimatedListingRaw;

    const listingGain = listingMatch
      ? `${listingMatch[2]}%`
      : "0.00%";

    ipoData.push({
      id: index + 1,
      name: ipoName,
      url: ipoUrl,
      gmp,
      trend,
      priceBand,
      estimatedListing,
      listingGain,
      ipoDate,
      status,
      lastUpdated,
    });
  });

  return ipoData;
}

async function saveToJSON(
  data: IPO[]
): Promise<void> {
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  console.log(
    `Saved ${data.length} IPOs to ipos.json`
  );
}

async function main(): Promise<void> {
  try {
    const data = await scrapeIPOData();

    if (data.length === 0) {
      console.log("No IPO data found.");
      return;
    }

    await saveToJSON(data);
  } catch (error) {
    console.error(
      "Scraping failed:",
      error instanceof Error
        ? error.message
        : error
    );

    process.exit(1);
  }
}

main();