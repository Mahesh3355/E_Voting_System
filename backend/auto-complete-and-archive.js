const cron = require("node-cron");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const { ElectionEvent } = require("./models");

const BACKEND_URL = "http://localhost:5000"; // Change if your backend runs elsewhere

const archivedElectionResultsSchema = new mongoose.Schema(
  {},
  { strict: false }
);
const ArchivedElectionResults = mongoose.model(
  "ArchivedElectionResults",
  archivedElectionResultsSchema,
  "archivedElectionResults"
);

async function archiveElectionWithRetry(electionId, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await axios.post(`${BACKEND_URL}/api/elections/archive/${electionId}`);
      return true;
    } catch (err) {
      console.error(
        `Archive attempt ${attempt} for election ${electionId} failed:`,
        err.response ? err.response.data : err
      );
      if (attempt === retries) return false;
    }
  }
}

async function processElections() {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  console.log(`[INFO] Starting election processing at ${now.toISOString()}`);
  const events = await ElectionEvent.find({
    votingEnd: { $lt: now }, // Process immediately after voting ends
  });
  console.log(`[INFO] Found ${events.length} events to process.`);
  for (const event of events) {
    console.log(
      `[INFO] Processing election ${event.blockchainElectionId} | votingEnd: ${
        event.votingEnd
      } | now: ${now.toISOString()}`
    );
    // 5. Election event deleted or corrupted
    if (!event || !event.blockchainElectionId || !event.votingEnd) {
      console.error(
        `[ERROR] Election event corrupted or missing: ${
          event ? event._id : "unknown"
        }`
      );
      continue;
    }
    // Check if already archived
    const alreadyArchived = await ArchivedElectionResults.findOne({
      blockchainElectionId: event.blockchainElectionId,
    });
    if (alreadyArchived) {
      console.log(
        `[INFO] Election ${event.blockchainElectionId} already archived. Skipping.`
      );
      continue;
    }
    // Defensive: Check votingEnd with UTC and buffer
    if (new Date() < new Date(event.votingEnd).getTime() + 60 * 1000) {
      console.log(
        `[INFO] Election ${event.blockchainElectionId} votingEnd not reached yet (with buffer). Skipping.`
      );
      continue;
    }
    try {
      // 1. Complete the election on-chain, handle 'already completed' gracefully
      let completed = false;
      let completeError = null;
      try {
        console.log(
          `[ACTION] Attempting to complete election on-chain: ${event.blockchainElectionId}`
        );
        await axios.post(
          `${BACKEND_URL}/api/blockchain/complete-election/${event.blockchainElectionId}`
        );
        completed = true;
        console.log(
          `[SUCCESS] [TIMER] Election ${
            event.blockchainElectionId
          } completed by scheduler at ${new Date().toISOString()}`
        );
      } catch (err) {
        const errMsg =
          err.response && err.response.data && err.response.data.error
            ? err.response.data.error
            : err.message;
        if (errMsg && errMsg.toLowerCase().includes("already completed")) {
          console.log(
            `[INFO] Election ${event.blockchainElectionId} already completed on-chain.`
          );
          completed = true;
        } else {
          completeError = errMsg;
          console.error(
            `[ERROR] Failed to complete election ${event.blockchainElectionId}: ${errMsg}`
          );
        }
      }
      // 3. Blockchain tx fails (other reasons): retry with exponential backoff (up to 3 times)
      let retries = 0;
      while (!completed && retries < 3 && completeError) {
        const delay = Math.pow(2, retries) * 1000;
        console.warn(
          `[WARN] Retrying completion for election ${
            event.blockchainElectionId
          } in ${delay / 1000}s due to error: ${completeError}`
        );
        await new Promise((res) => setTimeout(res, delay));
        try {
          await axios.post(
            `${BACKEND_URL}/api/blockchain/complete-election/${event.blockchainElectionId}`
          );
          completed = true;
          completeError = null;
          console.log(
            `[SUCCESS] Election ${
              event.blockchainElectionId
            } completed on retry #${retries + 1}`
          );
        } catch (err) {
          const errMsg =
            err.response && err.response.data && err.response.data.error
              ? err.response.data.error
              : err.message;
          if (errMsg && errMsg.toLowerCase().includes("already completed")) {
            console.log(
              `[INFO] Election ${event.blockchainElectionId} already completed on-chain (retry).`
            );
            completed = true;
            completeError = null;
          } else {
            completeError = errMsg;
            console.error(
              `[ERROR] Retry #${retries + 1} failed for election ${
                event.blockchainElectionId
              }: ${errMsg}`
            );
          }
        }
        retries++;
      }
      if (!completed) {
        console.error(
          `[ERROR] Failed to complete election ${event.blockchainElectionId} after retries: ${completeError}`
        );
        continue;
      }
      // 2. Archive the results (with retry)
      console.log(
        `[ACTION] Attempting to archive results for election ${event.blockchainElectionId}`
      );
      const archived = await archiveElectionWithRetry(
        event.blockchainElectionId
      );
      if (archived) {
        // Fetch results to check for no candidates or no votes
        try {
          const resultsRes = await axios.get(
            `${BACKEND_URL}/api/blockchain/election-results/${event.blockchainElectionId}`
          );
          const results =
            resultsRes.data && resultsRes.data.results
              ? resultsRes.data.results
              : null;
          if (
            !results ||
            !results.positions ||
            results.positions.length === 0
          ) {
            console.warn(
              `[WARN] Election ${event.blockchainElectionId} archived: No candidates registered.`
            );
          } else if (
            results.winningVoteCounts &&
            results.winningVoteCounts.every((v) => v === 0)
          ) {
            console.warn(
              `[WARN] Election ${event.blockchainElectionId} archived: No votes cast.`
            );
          }
        } catch (err) {
          console.warn(
            `[WARN] Could not fetch results for election ${event.blockchainElectionId} after archiving. Error:`,
            err
          );
        }
        console.log(
          `[SUCCESS] Election ${event.blockchainElectionId} processed and archived.`
        );
        // Delete the event after successful archiving
        await ElectionEvent.deleteOne({
          blockchainElectionId: event.blockchainElectionId,
        });
        console.log(
          `[CLEANUP] Deleted election event ${event.blockchainElectionId} after archiving.`
        );
      } else {
        console.error(
          `[ERROR] Failed to archive election ${event.blockchainElectionId} after retries.`
        );
      }
    } catch (err) {
      console.error(
        `[ERROR] Error processing election ${event.blockchainElectionId}:`,
        err.response ? err.response.data : err
      );
    }
  }
  await mongoose.disconnect();
  console.log(
    `[INFO] Finished election processing at ${new Date().toISOString()}`
  );
}

// Run every minute
cron.schedule("* * * * *", processElections);

console.log("Election auto-completion and archiving scheduler started.");
