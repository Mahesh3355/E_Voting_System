// index.

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const blockchainService = require("./blockchain");
const { Voter, ElectionEvent, Candidate } = require("./models");
const { ethers } = require("ethers");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Initialize express
const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Allow requests from your frontend
app.use(
  cors({
    origin: "http://localhost:3000", // or use '*' for all origins (not recommended for production)
    credentials: true, // if you need to send cookies/auth headers
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
// app.use(limiter);

// Comment out all other middleware for debugging
// console.log("DEBUG: Setting up body parser");
console.log("DEBUG: Setting up body parser");
app.use(express.json({ limit: "10mb" }));

console.log("DEBUG: Setting up urlencoded parser");
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const otpStore = {}; // In-memory store for OTPs

// Configure your email transporter (use your Gmail or other SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Top-level middleware to log all incoming requests
app.use((req, res, next) => {
  console.log("DEBUG: Incoming request:", req.method, req.url);
  next();
});

// Error handling middleware
// app.use((err, req, res, next) => { ... });

// Offline support middleware
// app.use((req, res, next) => { ... });

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Service is healthy",
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    blockchain: blockchainService.isConnected() ? "connected" : "disconnected",
  });
});

// Set up multer for candidate photo uploads
const uploadDir = path.join(__dirname, "uploads", "candidates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Serve candidate uploads as static files
// Before static file serving for uploads/candidates
app.use(
  "/uploads/candidates",
  cors(),
  (req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
  },
  express.static(uploadDir)
);

// Endpoint to send OTP
app.post("/api/voter/send-otp", async (req, res) => {
  const { fullName, registrationNumber, email, degree } = req.body;
  if (!fullName || !registrationNumber || !email || !degree) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  // Check if email is already registered
  const existingVoter = await Voter.findOne({ email });
  if (existingVoter) {
    console.log("Attempt to register with already registered email:", email);
    return res.status(400).json({
      success: false,
      message: "This email is already registered as a voter.",
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with expiry (5 minutes)
  otpStore[email] = {
    otp,
    expires: Date.now() + 5 * 60 * 1000,
    fullName,
    registrationNumber,
    degree,
  };

  // Send OTP email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Voter Registration",
      text: `Your OTP is: ${otp}`,
    });
    res.json({ success: true, message: "OTP sent to email." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
      error: error.message,
    });
  }
});

// Endpoint to verify OTP and register voter
app.post("/api/voter/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res
      .status(400)
      .json({ success: false, message: "No OTP sent to this email." });
  }
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired." });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }

  // Save voter to MongoDB with Hardhat wallet and register on blockchain
  try {
    // Check if voter already exists
    let voter = await Voter.findOne({ email });
    if (voter) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered as a voter.",
      });
    }
    // List of Hardhat private keys (for testing only!)
    const hardhatPrivateKeys = [
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
      "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
      "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
      "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
      "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
      "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
      "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
    ];
    // Find an unused Hardhat account
    const usedKeys = await Voter.find({
      privateKey: { $in: hardhatPrivateKeys },
    }).distinct("privateKey");
    const availableKey = hardhatPrivateKeys.find(
      (pk) => !usedKeys.includes(pk)
    );
    if (!availableKey) {
      return res.status(400).json({
        success: false,
        message: "No Hardhat accounts left for registration.",
      });
    }
    const wallet = new ethers.Wallet(availableKey, blockchainService.provider);
    // Register voter on blockchain
    const regResult = await blockchainService.registerVoter(wallet);
    if (!regResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to register voter on blockchain.",
        error: regResult.error,
      });
    }
    voter = new Voter({
      fullName: record.fullName,
      registrationNumber: record.registrationNumber,
      email,
      degree: record.degree,
      walletAddress: wallet.address,
      privateKey: availableKey,
      isBlockchainRegistered: true,
    });
    await voter.save();
    delete otpStore[email];
    res.json({
      success: true,
      message: "Voter registered successfully!",
      walletAddress: wallet.address,
      privateKey: availableKey,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to register voter.",
      error: err.message,
    });
  }
});

// Endpoint to send OTP for login
app.post("/api/voter/login-send-otp", async (req, res) => {
  const { email } = req.body;
  console.log("Login OTP requested for email:", email);
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }
  // Check if voter exists
  const voter = await Voter.findOne({ email });
  console.log("Voter found:", !!voter);
  if (!voter) {
    return res.status(404).json({
      success: false,
      message: "No voter registered with this email.",
    });
  }
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Store OTP with expiry (5 minutes)
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  // Send OTP email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP for VoteChain",
      text: `Your OTP is: ${otp}`,
    });
    res.json({ success: true, message: "OTP sent to email." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
      error: error.message,
    });
  }
});

// Endpoint to verify OTP for login
app.post("/api/voter/login-verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) {
    return res
      .status(400)
      .json({ success: false, message: "No OTP sent to this email." });
  }
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired." });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }
  // Fetch voter data
  try {
    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res
        .status(404)
        .json({ success: false, message: "Voter not found." });
    }
    delete otpStore[email];
    res.json({ success: true, message: "Login successful!", voter });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to login.",
      error: err.message,
    });
  }
});

// Admin login endpoint
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({ success: true, message: "Admin login successful!" });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Incorrect username or password." });
  }
});

// Get current (latest) election event
app.get("/api/events/current", async (req, res) => {
  try {
    const event = await ElectionEvent.findOne().sort({ createdAt: -1 });
    if (!event) return res.json({ event: null });
    res.json({
      event: {
        ...event.toObject(),
        electionId: event.blockchainElectionId,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event.",
      error: err.message,
    });
  }
});

// Create a new election event (admin only, one at a time)
app.post("/api/events/create", async (req, res) => {
  const { title, registrationStart, registrationEnd, votingStart, votingEnd } =
    req.body;
  if (
    !title ||
    !registrationStart ||
    !registrationEnd ||
    !votingStart ||
    !votingEnd
  ) {
    console.error(
      "[ERROR] Missing required fields in election creation",
      req.body
    );
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  // Validate date order
  try {
    const regStart = new Date(registrationStart);
    const regEnd = new Date(registrationEnd);
    const voteStart = new Date(votingStart);
    const voteEnd = new Date(votingEnd);
    const now = new Date();

    if (
      isNaN(regStart.getTime()) ||
      isNaN(regEnd.getTime()) ||
      isNaN(voteStart.getTime()) ||
      isNaN(voteEnd.getTime())
    ) {
      console.error(
        "[ERROR] Invalid date format in election creation",
        req.body
      );
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format." });
    }

    if (
      regStart <= now ||
      regEnd <= now ||
      voteStart <= now ||
      voteEnd <= now
    ) {
      console.error("[ERROR] All dates must be in the future", req.body);
      return res
        .status(400)
        .json({ success: false, message: "All dates must be in the future." });
    }

    if (!(regStart < regEnd && regEnd < voteStart && voteStart < voteEnd)) {
      console.error(
        "[ERROR] Invalid date order. Must be: Registration Start < Registration End < Voting Start < Voting End",
        req.body
      );
      return res.status(400).json({
        success: false,
        message:
          "Invalid date order. Must be: Registration Start < Registration End < Voting Start < Voting End.",
      });
    }
  } catch (err) {
    console.error("[ERROR] Date validation failed", err);
    return res
      .status(400)
      .json({ success: false, message: "Date validation failed." });
  }

  try {
    await ElectionEvent.deleteMany({});
    const event = new ElectionEvent({
      title,
      registrationStart,
      registrationEnd,
      votingStart,
      votingEnd,
    });
    await event.save();
    const result = await blockchainService.createElection(
      title,
      "Election created via admin panel.",
      Math.floor(new Date(votingStart).getTime() / 1000),
      Math.floor(new Date(votingEnd).getTime() / 1000)
    );
    if (result.success && result.electionId) {
      event.blockchainElectionId = Number(result.electionId);
      event.isBlockchainCreated = true;
      await event.save();
      console.log(
        `[SUCCESS] Election created on blockchain. MongoDB ID: ${event._id}, Blockchain ID: ${result.electionId}`
      );
      return res.json({
        success: true,
        message: "Election event and blockchain election created successfully!",
        event,
        blockchainElectionId: Number(result.electionId),
        transactionHash:
          result.transactionHash && result.transactionHash.toString
            ? result.transactionHash.toString()
            : result.transactionHash,
      });
    } else {
      await ElectionEvent.findByIdAndDelete(event._id);
      console.error(
        "[ERROR] Blockchain election creation failed",
        result.error
      );
      return res.status(500).json({
        success: false,
        message: "Failed to create election on blockchain.",
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[ERROR] Exception during election creation", err);
    res.status(500).json({
      success: false,
      message: "Failed to create election event.",
      error: err.message,
    });
  }
});

// Helper to delete all files in uploads/candidates
function deleteAllCandidatePhotos() {
  if (fs.existsSync(uploadDir)) {
    fs.readdirSync(uploadDir).forEach((file) => {
      fs.unlinkSync(path.join(uploadDir, file));
    });
  }
}

// Delete the current (latest) election event
app.delete("/api/events/current", async (req, res) => {
  try {
    const event = await ElectionEvent.findOne().sort({ createdAt: -1 });
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "No event to delete." });
    await ElectionEvent.deleteOne({ _id: event._id });
    await Candidate.deleteMany({});
    deleteAllCandidatePhotos();
    res.json({ success: true, message: "Event deleted." });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete event.",
      error: err.message,
    });
  }
});

// Scheduled cleanup: Archive and delete events whose votingEnd has passed
/*
if (process.env.NODE_ENV !== "test") {
  setInterval(async () => {
    try {
      const now = new Date();
      const expiredEvents = await ElectionEvent.find({
        votingEnd: { $lt: now },
        isBlockchainCreated: true,
      });
      for (const event of expiredEvents) {
        // Check if already archived
        const archived = await ArchivedElectionResults.findOne({
          blockchainElectionId: event.blockchainElectionId,
        });
        if (!archived) {
          // Try to fetch results from blockchain
          let result;
          try {
            result = await blockchainService.getElectionResults(
              event.blockchainElectionId
            );
          } catch (err) {
            result = { success: false, error: err.message };
          }
          if (result && result.success) {
            await new ArchivedElectionResults({
              blockchainElectionId: event.blockchainElectionId,
              title: event.title,
              registrationStart: event.registrationStart,
              registrationEnd: event.registrationEnd,
              votingStart: event.votingStart,
              votingEnd: event.votingEnd,
              results: result.results,
            }).save();
            console.log(
              `[AUTO] Archived results for election ${event.blockchainElectionId}`
            );
            console.log(
              `[AUTO] Election ${event.blockchainElectionId} ended on-chain by backend after voting ended.`
            );
          } else {
            console.warn(
              `[AUTO] Could not archive results for election ${event.blockchainElectionId}: ${result.error}`
            );
            // Skip deletion if not archived
            continue;
          }
        }
        // Now safe to delete
        await ElectionEvent.deleteOne({ _id: event._id });
        console.log(
          `[AUTO] Deleted expired election event ${event.blockchainElectionId}`
        );
      }
    } catch (err) {
      console.error("[AUTO] Error in election archive/cleanup scheduler:", err);
    }
  }, 30 * 1000); // Runs every 30 seconds
}
*/

// === Automated Election Completion Scheduler ===
setInterval(async () => {
  try {
    const now = new Date();
    // Find all events where votingEnd has passed and isBlockchainCreated is true
    const events = await ElectionEvent.find({
      votingEnd: { $lt: now },
      isBlockchainCreated: true,
    });
    for (const event of events) {
      // Try to fetch results to see if already completed
      try {
        await blockchainService.getElectionResults(event.blockchainElectionId);
        // If no error, election is already completed
        continue;
      } catch (err) {
        // If error is 'Election not completed yet', try to complete
        if (
          err &&
          err.message &&
          err.message.includes("Election not completed yet")
        ) {
          const result = await blockchainService.completeElection(
            event.blockchainElectionId
          );
          if (result.success) {
            console.log(
              `[AUTO] Election ${event.blockchainElectionId} completed automatically after voting end.`
            );
          } else {
            console.error(
              `[AUTO] Failed to complete election ${event.blockchainElectionId}:`,
              result.error
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("[AUTO] Error in election completion scheduler:", err);
  }
}, 60 * 1000); // Runs every 60 seconds

// Candidate Registration Endpoint (with photo upload)
app.post(
  "/api/candidate/register",
  upload.single("profilePic"),
  async (req, res) => {
    const {
      name,
      scholarId,
      email,
      phone,
      degree,
      branch,
      year,
      cgpa,
      address,
      position,
      achievements,
      experience,
      manifestoUrl,
    } = req.body;
    let profilePicUrl = req.file
      ? `/uploads/candidates/${req.file.filename}`
      : "";
    if (
      !name ||
      !scholarId ||
      !email ||
      !phone ||
      !degree ||
      !branch ||
      !year ||
      !cgpa ||
      !address ||
      !position
    ) {
      // Delete uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }
    try {
      // Check for duplicate email
      const existingEmail = await Candidate.findOne({ email });
      if (existingEmail) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "A candidate with this email already exists.",
        });
      }

      // Validate scholarId format (must be 7 digits)
      if (!/^\d{7}$/.test(scholarId)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Scholar ID must be exactly 7 digits.",
        });
      }

      // Check for duplicate scholarId
      const existingScholarId = await Candidate.findOne({ scholarId });
      if (existingScholarId) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "A candidate with this Scholar ID already exists.",
        });
      }
      const candidate = new Candidate({
        name,
        scholarId,
        email,
        phone,
        degree,
        branch,
        year,
        cgpa,
        address,
        position,
        achievements,
        experience,
        manifestoUrl,
        profilePicUrl,
        walletAddress: "",
        privateKey: "",
        blockchainCandidateId: 0,
        isBlockchainRegistered: false,
      });
      await candidate.save();
      res.json({
        success: true,
        message:
          "Candidate registered successfully! Your application is pending review.",
      });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({
        success: false,
        message: "Failed to register candidate.",
        error: err.message,
      });
    }
  }
);

// Get all pending candidates (admin review)
app.get("/api/candidate/pending", async (req, res) => {
  try {
    const candidates = await Candidate.find({ status: "pending" });
    res.json({ success: true, candidates });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates.",
      error: err.message,
    });
  }
});

// Update candidate status (approve/reject)
app.post("/api/candidate/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    console.error(`[ERROR] Invalid status '${status}' for candidate ${id}`);
    return res.status(400).json({ success: false, message: "Invalid status." });
  }
  try {
    let candidate = await Candidate.findById(id);
    if (!candidate) {
      console.error(`[ERROR] Candidate not found: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found." });
    }
    if (status === "approved") {
      const event = await ElectionEvent.findOne().sort({ createdAt: -1 });
      console.log("[DEBUG] blockchainElectionId:", event?.blockchainElectionId);
      if (!event || !event.blockchainElectionId) {
        console.error(
          `[ERROR] No active election or blockchain election ID found for candidate approval. Candidate: ${id}`
        );
        return res.status(400).json({
          success: false,
          message: "No active election or blockchain election ID found.",
        });
      }
      if (!candidate.walletAddress) {
        const wallet = blockchainService.createWallet();
        candidate.walletAddress = wallet.address;
        candidate.privateKey = wallet.privateKey;
        await candidate.save();
      }
      // Fund candidate wallet with 0.06 ETH before registering
      const fundTx = await blockchainService.adminWallet.sendTransaction({
        to: candidate.walletAddress,
        value: ethers.parseEther("0.06"),
      });
      await fundTx.wait();
      // Use scholarId as candidateNumber (must be 7 digits)
      if (!candidate.candidateNumber) {
        candidate.candidateNumber = parseInt(candidate.scholarId);
        await candidate.save();
      }
      const wallet = blockchainService.getWalletFromPrivateKey(
        candidate.privateKey
      );
      const result = await blockchainService.registerCandidate(
        event.blockchainElectionId,
        candidate.name,
        candidate.position,
        candidate.candidateNumber, // Use numeric candidateNumber
        wallet
      );
      if (result.success && result.blockchainCandidateId) {
        candidate.status = "approved";
        candidate.blockchainCandidateId = result.blockchainCandidateId;
        candidate.isBlockchainRegistered = true;
        await candidate.save();
        console.log(
          `[SUCCESS] Candidate approved and registered on blockchain. Candidate ID: ${candidate._id}, Blockchain Candidate ID: ${result.blockchainCandidateId}`
        );
      } else {
        console.error(
          `[ERROR] Blockchain registration failed for candidate ${id}:`,
          result.error
        );
        return res.status(500).json({
          success: false,
          message: "Blockchain registration failed.",
          error: result.error,
        });
      }
    } else if (status === "rejected") {
      await Candidate.findByIdAndDelete(id);
      console.log(`[INFO] Candidate rejected and deleted: ${id}`);
      return res.json({
        success: true,
        message: "Candidate rejected and deleted.",
      });
    }
    res.json({ success: true, candidate });
  } catch (err) {
    console.error(
      `[ERROR] Exception during candidate status update for ${id}:`,
      err
    );
    res.status(500).json({
      success: false,
      message: "Failed to update candidate status.",
      error: err.message,
    });
  }
});

// Get all approved candidates for a given position
app.get("/api/candidate/approved", async (req, res) => {
  try {
    const { position } = req.query;
    const candidates = await Candidate.find({ status: "approved", position });
    res.json({
      success: true,
      candidates: candidates.map((c) => ({
        ...c.toObject(),
        candidateNumber: c.blockchainCandidateId || c.scholarId,
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidates.",
      error: err.message,
    });
  }
});

// ===== BLOCKCHAIN INTEGRATION ENDPOINTS =====

// Create election on blockchain
app.post("/api/blockchain/create-election", async (req, res) => {
  const { name, description, startTime, endTime } = req.body;

  if (!name || !description || !startTime || !endTime) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const result = await blockchainService.createElection(
      name,
      description,
      startTime,
      endTime
    );

    if (result.success) {
      // Update the current election event with blockchain data
      const event = await ElectionEvent.findOne().sort({ createdAt: -1 });
      if (event) {
        event.blockchainElectionId = result.electionId;
        event.isBlockchainCreated = true;
        await event.save();
      }

      res.json({
        success: true,
        message: "Election created on blockchain successfully!",
        electionId: result.electionId,
        transactionHash: result.transactionHash,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create election on blockchain.",
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create election.",
      error: error.message,
    });
  }
});

// Register voter on blockchain
app.post("/api/blockchain/register-voter", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  try {
    // Find voter in database
    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res
        .status(404)
        .json({ success: false, message: "Voter not found in database." });
    }

    if (voter.isBlockchainRegistered) {
      return res.status(400).json({
        success: false,
        message: "Voter already registered on blockchain.",
      });
    }

    // Create wallet if not exists
    if (!voter.walletAddress) {
      const wallet = blockchainService.createWallet();
      voter.walletAddress = wallet.address;
      voter.privateKey = wallet.privateKey; // In production, encrypt this
      await voter.save();
    }

    // Register on blockchain
    const wallet = blockchainService.getWalletFromPrivateKey(voter.privateKey);
    const result = await blockchainService.registerVoter(wallet);

    if (result.success) {
      voter.isBlockchainRegistered = true;
      await voter.save();

      res.json({
        success: true,
        message: "Voter registered on blockchain successfully!",
        walletAddress: voter.walletAddress,
        transactionHash: result.transactionHash,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to register voter on blockchain.",
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register voter.",
      error: error.message,
    });
  }
});

// Register candidate on blockchain
app.post("/api/blockchain/register-candidate", async (req, res) => {
  const { candidateId, electionId } = req.body;

  if (!candidateId || !electionId) {
    return res.status(400).json({
      success: false,
      message: "Candidate ID and Election ID are required.",
    });
  }

  try {
    // Find candidate in database
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found in database." });
    }

    if (candidate.isBlockchainRegistered) {
      return res.status(400).json({
        success: false,
        message: "Candidate already registered on blockchain.",
      });
    }

    // Create wallet if not exists
    if (!candidate.walletAddress) {
      const wallet = blockchainService.createWallet();
      candidate.walletAddress = wallet.address;
      candidate.privateKey = wallet.privateKey; // In production, encrypt this
      await candidate.save();
    }

    // Register on blockchain
    const wallet = blockchainService.getWalletFromPrivateKey(
      candidate.privateKey
    );
    const result = await blockchainService.registerCandidate(
      electionId,
      candidate.name,
      candidate.position,
      candidate._id.toString(),
      wallet
    );

    if (result.success) {
      candidate.isBlockchainRegistered = true;
      candidate.blockchainCandidateId = result.blockchainCandidateId;
      await candidate.save();

      res.json({
        success: true,
        message: "Candidate registered on blockchain successfully!",
        walletAddress: candidate.walletAddress,
        transactionHash: result.transactionHash,
        blockchainCandidateId: result.blockchainCandidateId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to register candidate on blockchain.",
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to register candidate.",
      error: error.message,
    });
  }
});

// Cast vote on blockchain
app.post("/api/blockchain/cast-vote", async (req, res) => {
  // Debug: log the incoming request body
  console.log("Incoming cast-vote body:", req.body);

  const { electionId, candidateId, accountAddress } = req.body;

  // Early input validation
  if (!electionId || !candidateId || !accountAddress) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields.",
    });
  }

  try {
    // Try to find voter in MongoDB
    let voter = await Voter.findOne({ walletAddress: accountAddress });
    // If voter exists but has no wallet/privateKey, assign them a Hardhat account
    if (voter && (!voter.privateKey || !voter.walletAddress)) {
      // List of Hardhat private keys (for testing only!)
      const hardhatPrivateKeys = [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
        "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
        "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
        "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
        "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
        "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
      ];
      // Find an unused Hardhat account
      const usedWallets = await Voter.find({
        privateKey: { $in: hardhatPrivateKeys },
      }).distinct("privateKey");
      const availableKey = hardhatPrivateKeys.find(
        (pk) => !usedWallets.includes(pk)
      );
      if (availableKey) {
        const wallet = blockchainService.getWalletFromPrivateKey(availableKey);
        voter.walletAddress = wallet.address;
        voter.privateKey = availableKey;
        await voter.save();
      }
    }

    // Get wallet from account address (Hardhat account)
    let wallet = blockchainService.getWalletFromAccountAddress(accountAddress);
    if (!wallet && voter && voter.privateKey) {
      wallet = blockchainService.getWalletFromPrivateKey(voter.privateKey);
    }
    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Invalid account address or wallet not found.",
      });
    }

    // Check if voter is registered on-chain
    const voterStatus = await blockchainService.getVoter(wallet.address);
    if (!voterStatus.success || !voterStatus.voter.isRegistered) {
      // Register voter on-chain (will require ETH for gas/fee)
      const regResult = await blockchainService.registerVoter(wallet);
      if (!regResult.success) {
        return res.status(503).json({
          success: false,
          message: "Failed to auto-register voter for testing.",
          error: regResult.error,
        });
      }
    }

    // Cast vote on blockchain (wrap in try/catch for contract errors)
    try {
      const result = await blockchainService.castVote(
        electionId,
        candidateId,
        wallet
      );

      if (result.success) {
        console.log(
          `[VOTE] Vote cast and counted! ElectionId: ${electionId}, CandidateId: ${candidateId}, Voter: ${wallet.address}, TxHash: ${result.transactionHash}`
        );
        res.json({
          success: true,
          message: "Vote cast successfully on blockchain!",
          transactionHash: result.transactionHash,
        });
      } else {
        res.status(503).json({
          success: false,
          message: "Voting failed.",
          error: result.error,
        });
      }
    } catch (err) {
      console.error("Vote failed:", err);
      return res
        .status(503)
        .json({ success: false, message: "Voting failed." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Get election results from blockchain or archive
app.get("/api/blockchain/election-results/:electionId", async (req, res) => {
  const { electionId } = req.params;
  console.log(
    `[API] /api/blockchain/election-results called for electionId: ${electionId}`
  );

  try {
    // 1. Try to find in archive first
    const archive = await ArchivedElectionResults.findOne({
      blockchainElectionId: Number(electionId),
    });
    if (archive) {
      return res.json({ success: true, results: archive.results });
    }
    // 2. Fallback to main collection as before
    let event = await ElectionEvent.findOne({
      blockchainElectionId: Number(electionId),
    });
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Election not found." });
    }
    // Fetch the event from DB (already found)
    const now = Date.now();
    if (now < new Date(event.votingEnd).getTime()) {
      return res.status(403).json({
        success: false,
        message:
          "Voting is still ongoing. Results not available until voting ends.",
      });
    }

    const result = await blockchainService.getElectionResults(electionId);

    if (result.success) {
      res.json({
        success: true,
        results: result.results,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to get election results.",
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get election results.",
      error: error.message,
    });
  }
});

// Complete election on blockchain
app.post("/api/blockchain/complete-election/:electionId", async (req, res) => {
  const { electionId } = req.params;

  // Validate electionId is a valid number
  const electionIdNum = parseInt(electionId);
  if (isNaN(electionIdNum)) {
    console.error(`[ERROR] Invalid electionId provided: ${electionId}`);
    return res.status(400).json({
      success: false,
      message: "Invalid election ID. Must be a valid number.",
    });
  }

  try {
    // Check if election exists in database
    const event = await ElectionEvent.findOne({
      blockchainElectionId: electionIdNum,
    });
    if (!event) {
      console.error(`[ERROR] Election not found in database: ${electionIdNum}`);
      return res.status(404).json({
        success: false,
        message: "Election not found in database.",
      });
    }

    const result = await blockchainService.completeElection(electionIdNum);

    if (result.success) {
      console.log(
        `[SUCCESS] Election completed on blockchain. Election ID: ${electionIdNum}`
      );
      res.json({
        success: true,
        message: "Election completed successfully!",
        transactionHash: result.transactionHash,
      });
    } else {
      console.error(
        `[ERROR] Failed to complete election ${electionIdNum}:`,
        result.error
      );
      res.status(500).json({
        success: false,
        message: "Failed to complete election.",
        error: result.error,
      });
    }
  } catch (error) {
    console.error(
      `[ERROR] Exception during election completion for ${electionIdNum}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Failed to complete election.",
      error: error.message,
    });
  }
});

// Get predefined positions from blockchain
app.get("/api/blockchain/positions", async (req, res) => {
  try {
    const result = await blockchainService.getPredefinedPositions();

    if (result.success) {
      res.json({
        success: true,
        positions: result.positions,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to get positions.",
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get positions.",
      error: error.message,
    });
  }
});

// Get active elections from blockchain
app.get("/api/blockchain/active-elections", async (req, res) => {
  try {
    const result = await blockchainService.getActiveElections();
    if (result.success) {
      // Convert all BigInt values to strings
      const elections = {};
      for (const [key, arr] of Object.entries(result.elections)) {
        elections[key] = Array.isArray(arr)
          ? arr.map((v) => (typeof v === "bigint" ? v.toString() : v))
          : arr;
      }
      res.json({ success: true, elections });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to fetch active elections.",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("[ERROR] Exception in getActiveElections endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active elections.",
      error: error.message,
    });
  }
});

// Get voter blockchain status
app.get("/api/blockchain/voter-status/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res
        .status(404)
        .json({ success: false, message: "Voter not found." });
    }

    if (!voter.isBlockchainRegistered) {
      return res.json({
        success: true,
        isRegistered: false,
        message: "Voter not registered on blockchain",
      });
    }

    // Get blockchain voter info
    const blockchainResult = await blockchainService.getVoter(
      voter.walletAddress
    );

    if (blockchainResult.success) {
      res.json({
        success: true,
        isRegistered: true,
        walletAddress: voter.walletAddress,
        blockchainInfo: blockchainResult.voter,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to get blockchain voter info.",
        error: blockchainResult.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get voter status.",
      error: error.message,
    });
  }
});

// Get candidate blockchain status
app.get("/api/blockchain/candidate-status/:candidateId", async (req, res) => {
  const { candidateId } = req.params;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Candidate not found." });
    }

    if (!candidate.isBlockchainRegistered) {
      return res.json({
        success: true,
        isRegistered: false,
        message: "Candidate not registered on blockchain",
      });
    }

    // Get blockchain candidate info
    const blockchainResult = await blockchainService.getCandidate(
      candidate.blockchainElectionId || 1, // Default to election 1 if not set
      candidate.blockchainCandidateId
    );

    if (blockchainResult.success) {
      res.json({
        success: true,
        isRegistered: true,
        walletAddress: candidate.walletAddress,
        blockchainInfo: blockchainResult.candidate,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to get blockchain candidate info.",
        error: blockchainResult.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get candidate status.",
      error: error.message,
    });
  }
});

// Get all election events (active and ended)
app.get("/api/events/all", async (req, res) => {
  try {
    const events = await ElectionEvent.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      events: events.map((event) => ({
        id: event._id,
        blockchainElectionId: event.blockchainElectionId,
        title: event.title,
        registrationStart: event.registrationStart,
        registrationEnd: event.registrationEnd,
        votingStart: event.votingStart,
        votingEnd: event.votingEnd,
        isBlockchainCreated: event.isBlockchainCreated,
        createdAt: event.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch all election events.",
      error: err.message,
    });
  }
});

// ArchivedElectionResults Schema
const archivedElectionResultsSchema = new mongoose.Schema({
  blockchainElectionId: Number,
  title: String,
  registrationStart: Date,
  registrationEnd: Date,
  votingStart: Date,
  votingEnd: Date,
  archivedAt: { type: Date, default: Date.now },
  results: Object,
});
const ArchivedElectionResults =
  mongoose.models.ArchivedElectionResults ||
  mongoose.model("ArchivedElectionResults", archivedElectionResultsSchema);

// Helper to convert all BigInt values to strings
function convertBigInts(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigInts);
  } else if (typeof obj === "object" && obj !== null) {
    const res = {};
    for (const key in obj) {
      res[key] = convertBigInts(obj[key]);
    }
    return res;
  } else if (typeof obj === "bigint") {
    return obj.toString();
  }
  return obj;
}

// Archive election results before deletion
app.post("/api/elections/archive/:electionId", async (req, res) => {
  const { electionId } = req.params;
  try {
    // Fetch the event from DB
    const event = await ElectionEvent.findOne({
      blockchainElectionId: Number(electionId),
    });
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Election not found." });
    }
    // Defensive check: Ensure election is completed on-chain before archiving
    const completionCheck = await blockchainService.getElectionResults(
      electionId
    );
    if (!completionCheck.success) {
      return res.status(400).json({
        success: false,
        message:
          "Election is not completed on-chain. Cannot archive results until completion.",
        error: completionCheck.error,
      });
    }
    // Fetch results from blockchain (already checked above, but keep for clarity)
    const result = completionCheck;
    // Convert BigInts before saving
    const safeResults = convertBigInts(result.results);
    // --- NEW: Fetch all candidates and their votes for each position ---
    safeResults.candidates = {};
    if (safeResults.positions && Array.isArray(safeResults.positions)) {
      for (const position of safeResults.positions) {
        let positionCandidates = [];
        try {
          positionCandidates =
            await blockchainService.contract.getCandidatesByPosition(
              event.blockchainElectionId,
              position
            );
        } catch (err) {
          console.error(
            `Failed to fetch candidates for position ${position}:`,
            err
          );
          positionCandidates = [];
        }
        safeResults.candidates[position] = positionCandidates.map((c) => ({
          name: c.fullName,
          votes: c.voteCount ? c.voteCount.toString() : "0",
        }));
      }
    }
    // Archive to new collection
    const archive = new ArchivedElectionResults({
      blockchainElectionId: event.blockchainElectionId,
      title: event.title,
      registrationStart: event.registrationStart,
      registrationEnd: event.registrationEnd,
      votingStart: event.votingStart,
      votingEnd: event.votingEnd,
      results: safeResults,
    });
    await archive.save();
    // Automatically delete all candidates after archiving
    // TODO: If you have a field linking candidates to this election, filter by that field. Otherwise, this deletes all candidates.
    await Candidate.deleteMany({});
    res.json({ success: true, archive });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to archive election results.",
      error: err.message,
    });
  }
});

// Get the latest archived election result
app.get("/api/blockchain/latest-archived-result", async (req, res) => {
  try {
    const latest = await ArchivedElectionResults.findOne().sort({
      archivedAt: -1,
    });
    if (latest) {
      res.json({ success: true, results: latest.results, election: latest });
    } else {
      res
        .status(404)
        .json({ success: false, message: "No archived results found." });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching latest archived result.",
      error: err.message,
    });
  }
});

// Get a specific archived election result by ObjectId
app.get("/api/blockchain/archived-result/:objectId", async (req, res) => {
  try {
    const { objectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ObjectId." });
    }
    const doc = await ArchivedElectionResults.findById(objectId);
    if (doc) {
      res.json({ success: true, results: doc.results, election: doc });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Archived result not found." });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching archived result.",
      error: err.message,
    });
  }
});

// Check if voter has already voted for a position in an election
app.get("/api/blockchain/vote-status", async (req, res) => {
  const { electionId, voterAddress, position } = req.query;
  if (!electionId || !voterAddress || !position) {
    return res
      .status(400)
      .json({ success: false, message: "Missing parameters." });
  }
  try {
    const result = await blockchainService.hasVoterVotedForPosition(
      Number(electionId),
      voterAddress,
      position
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error checking vote status.",
      error: err.message,
    });
  }
});

// API endpoint to fetch voter details by email
app.get("/api/voter/by-email", async (req, res) => {
  const { email } = req.query;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });
  try {
    const voter = await Voter.findOne({ email });
    if (!voter)
      return res
        .status(404)
        .json({ success: false, message: "Voter not found" });
    // Only send safe fields
    const {
      fullName,
      registrationNumber,
      email: voterEmail,
      degree,
      walletAddress,
      isBlockchainRegistered,
      createdAt,
    } = voter;
    res.json({
      success: true,
      voter: {
        fullName,
        registrationNumber,
        email: voterEmail,
        degree,
        walletAddress,
        isBlockchainRegistered,
        createdAt,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});

function checkEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    console.log(`${name}: ❌ NOT SET`);
  } else {
    if (name === "PRIVATE_KEY") {
      console.log(
        `${name}: ✅ SET (${value.slice(0, 4)}...${value.slice(-4)})`
      );
    } else {
      console.log(`${name}: ✅ SET (${value})`);
    }
  }
}

checkEnvVar("PORT");
checkEnvVar("PRIVATE_KEY");
checkEnvVar("CONTRACT_ADDRESS");

if (require.main === module) {
  // Only connect to MongoDB and start the server if this file is run directly
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
      const port = process.env.PORT || 5000;
      app.listen(port, () => {
        console.log(`✅ Backend server running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to connect to MongoDB:", err.message);
    });
}

// Global error handler (at the very end, after all routes)
// app.use((err, req, res, next) => { ... });

module.exports = app;
