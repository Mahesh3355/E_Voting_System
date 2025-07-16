const mongoose = require("mongoose");

// Voter Schema
const voterSchema = new mongoose.Schema({
  fullName: String,
  registrationNumber: String,
  email: { type: String, unique: true },
  degree: String,
  walletAddress: String, // Blockchain wallet address
  privateKey: String, // Encrypted private key
  isBlockchainRegistered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Voter = mongoose.model("Voter", voterSchema);

// ElectionEvent Schema
const electionEventSchema = new mongoose.Schema({
  title: String,
  registrationStart: Date,
  registrationEnd: Date,
  votingStart: Date,
  votingEnd: Date,
  blockchainElectionId: Number, // ID from smart contract
  isBlockchainCreated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const ElectionEvent = mongoose.model("ElectionEvent", electionEventSchema);

// Candidate Schema
const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scholarId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  degree: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  cgpa: { type: String, required: true },
  address: { type: String, required: true },
  position: { type: String, required: true },
  achievements: { type: String },
  experience: { type: String },
  manifestoUrl: { type: String },
  profilePicUrl: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  walletAddress: String, // Blockchain wallet address
  privateKey: String, // Encrypted private key
  blockchainCandidateId: Number, // ID from smart contract
  isBlockchainRegistered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = { Voter, ElectionEvent, Candidate };
