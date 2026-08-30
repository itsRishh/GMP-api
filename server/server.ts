import express, {
  type Request,
  type Response,
} from "express";

import fs from "fs";
import path from "path";

const app = express();

const PORT = 3000;

const DATA_FILE = path.join(
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

interface IPOResponse {
  success: boolean;
  count: number;
  data: IPO[];
}


app.get(
  "/api/ipos",
  (
    _req: Request,
    res: Response<IPOResponse>
  ) => {

    try {

      if (!fs.existsSync(DATA_FILE)) {

        return res.status(404).json({
          success: false,
          count: 0,
          data: [],
        });

      }

      const file = fs.readFileSync(
        DATA_FILE,
        "utf-8"
      );

      const ipos: IPO[] = JSON.parse(file);

      return res.json({
        success: true,
        count: ipos.length,
        data: ipos,
      });

    } catch (error) {

      console.error(
        "Failed to read IPO data:",
        error
      );

      return res.status(500).json({
        success: false,
        count: 0,
        data: [],
      });
    }
  }
);


app.listen(PORT, () => {
  console.log(
    `IPO API running on http://localhost:${PORT}`
  );
});