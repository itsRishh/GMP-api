const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 3000;

const DATA_FILE = path.join(__dirname, "ipos.json");

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// API endpoint
app.get("/api/ipos", (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");

    const ipos = JSON.parse(data);

    res.json({
      success: true,
      count: ipos.length,
      data: ipos,
    });
  } catch (error) {
    console.error("Failed to read IPO data:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load IPO data",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});