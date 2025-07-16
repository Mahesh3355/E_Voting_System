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
const electionEventSchema = new mongoose.Schema({}, { strict: false });
const ElectionEvent = mongoose.model(
  "ElectionEvent",
  electionEventSchema,
  "electionevents"
);

// Use the backend's blockchainService for contract calls
const blockchainService = require("./blockchain");

(async () => {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // List archived elections
  const archived = await ArchivedElectionResults.find().lean();
  console.log("--- Archived Elections ---");
  archived.forEach((e) => {
    console.log(
      `ID: ${e.blockchainElectionId}, Title: ${e.title}, ArchivedAt: ${e.archivedAt}`
    );
  });
  if (archived.length === 0) console.log("No archived elections found.");

  // List active/past events
  const events = await ElectionEvent.find().lean();
  console.log("\n--- Election Events (in main collection) ---");
  events.forEach((e) => {
    console.log(
      `ID: ${e.blockchainElectionId}, Title: ${e.title}, VotingEnd: ${e.votingEnd}`
    );
  });
  if (events.length === 0) console.log("No election events found.");

  // Check on-chain completion for each event
  console.log("\n--- On-chain Completion Status ---");
  for (const e of events) {
    if (!e.blockchainElectionId) {
      console.log(`ID: ${e._id} (no blockchainElectionId)`);
      continue;
    }
    try {
      const result = await blockchainService.getElectionResults(
        e.blockchainElectionId
      );
      if (result.success) {
        console.log(
          `ID: ${e.blockchainElectionId} - Results available on-chain.`
        );
      } else {
        console.log(
          `ID: ${e.blockchainElectionId} - Results NOT available on-chain: ${result.error}`
        );
      }
    } catch (err) {
      console.log(
        `ID: ${e.blockchainElectionId} - Error checking on-chain: ${err.message}`
      );
    }
  }

  // Summary
  console.log("\n--- Summary ---");
  events.forEach((e) => {
    const isArchived = archived.some(
      (a) => a.blockchainElectionId === e.blockchainElectionId
    );
    if (!isArchived) {
      console.log(
        `Election ${e.blockchainElectionId} (${e.title}) is NOT archived.`
      );
    }
  });
  archived.forEach((a) => {
    const isEvent = events.some(
      (e) => e.blockchainElectionId === a.blockchainElectionId
    );
    if (!isEvent) {
      console.log(
        `Archived election ${a.blockchainElectionId} (${a.title}) is NOT in main collection (OK).`
      );
    }
  });

  await mongoose.disconnect();
})();
