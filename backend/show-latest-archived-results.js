const mongoose = require("mongoose");
require("dotenv").config();

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://parthivgundubogula:kLSO8fzBxk9ibrIV@cluster0.ckbd0.mongodb.net/votehsin";

const archivedElectionResultsSchema = new mongoose.Schema(
  {},
  { strict: false }
);
const ArchivedElectionResults = mongoose.model(
  "ArchivedElectionResults",
  archivedElectionResultsSchema,
  "archivedElectionResults"
);

async function showLatest() {
  await mongoose.connect(uri);
  const latest = await ArchivedElectionResults.findOne().sort({
    archivedAt: -1,
  });
  if (latest) {
    console.log("Latest archivedElectionResults document:");
    console.log(JSON.stringify(latest, null, 2));
  } else {
    console.log("No documents found in archivedElectionResults.");
  }
  await mongoose.disconnect();
}

showLatest();
