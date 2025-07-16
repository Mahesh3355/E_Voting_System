// export-archived-results.js
const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config({ path: "./.env" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set in .env");
  process.exit(1);
}

const archivedElectionResultsSchema = new mongoose.Schema(
  {},
  { strict: false }
);
const ArchivedElectionResults = mongoose.model(
  "ArchivedElectionResults",
  archivedElectionResultsSchema,
  "ArchivedElectionResults"
);

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const results = await ArchivedElectionResults.find().lean();
    fs.writeFileSync("archived_results.json", JSON.stringify(results, null, 2));
    console.log(
      `Exported ${results.length} archived results to archived_results.json`
    );
    process.exit();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
