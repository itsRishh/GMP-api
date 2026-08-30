const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const URL =
  "https://ipowatch.in/ipo-grey-market-premium-latest-ipo-gmp/";

const OUTPUT_FILE = path.join(__dirname, "ipos.json");

async function scrapeIPOData() {
  try {
    console.log("Fetching IPO data...");

    const { data: html } = await axios.get(URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);

    const ipoData = [];

    $("table tbody tr").each((index, row) => {
      const cells = $(row).find("td");

      if (cells.length < 8) return;

      const ipoUrl = $(cells[0]).find("a").attr("href") || "";

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

      const estimatedListing = $(cells[4])
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

      // Extract listing price and gain percentage
      const listingMatch = estimatedListing.match(
        /₹([\d,]+)\s*\(([\d.]+)%\)/
      );

      const listingPrice = listingMatch
        ? `₹${listingMatch[1]}`
        : estimatedListing;

      const listingGain = listingMatch
        ? `${listingMatch[2]}%`
        : "";

      ipoData.push({
        id: index + 1,
        name: ipoName,
        url: ipoUrl,
        gmp,
        trend,
        priceBand,
        estimatedListing: listingPrice,
        listingGain,
        ipoDate,
        status,
        lastUpdated,
      });
    });

    return ipoData;
  } catch (error) {
    console.error("Scraping failed:", error.message);
    throw error;
  }
}

async function saveToJSON(data) {
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  console.log(`Saved ${data.length} IPOs to ipos.json`);
}

async function main() {
  const data = await scrapeIPOData();

  if (!data.length) {
    console.log("No IPO data found.");
    return;
  }

  await saveToJSON(data);
}

main();