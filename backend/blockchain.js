const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { ethers } = require("ethers");
const fs = require("fs");

// Load contract ABI
const contractABI = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../contracts/artifacts/contracts/VotingSystem.sol/VotingSystem.json"
    ),
    "utf8"
  )
).abi;

class BlockchainService {
  constructor() {
    // Debug: Print environment variables
    console.log("RPC_URL:", process.env.RPC_URL);
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("Port:", process.env.PORT);
    console.log("Email_user:", process.env.EMAIL_USER);
    console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY);
    console.log("CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS);

    // Initialize provider (use your preferred network)
    this.provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || "http://localhost:8545"
    );

    // Initialize wallet (admin wallet for contract interactions)
    // Check if private key is provided and valid
    if (!process.env.PRIVATE_KEY) {
      console.warn(
        "⚠️  PRIVATE_KEY not found in environment variables. Blockchain operations will be limited."
      );
      this.adminWallet = null;
    } else {
      try {
        this.adminWallet = new ethers.Wallet(
          process.env.PRIVATE_KEY,
          this.provider
        );
        console.log("✅ Admin wallet initialized successfully");
      } catch (error) {
        console.error(
          "❌ Invalid PRIVATE_KEY in environment variables:",
          error.message
        );
        console.warn(
          "⚠️  Please check your .env file and ensure PRIVATE_KEY is a valid 64-character hex string"
        );
        this.adminWallet = null;
      }
    }

    // Contract address (will be set after deployment)
    this.contractAddress = process.env.CONTRACT_ADDRESS;

    // Initialize contract
    if (this.contractAddress && this.adminWallet) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI,
        this.adminWallet
      );
      console.log("✅ Smart contract initialized successfully");
    } else if (this.contractAddress && !this.adminWallet) {
      console.warn(
        "⚠️  Contract address found but no admin wallet. Contract operations will be read-only."
      );
    } else {
      console.warn(
        "⚠️  CONTRACT_ADDRESS not found. Please deploy the contract first."
      );
    }
  }

  // Set contract address after deployment
  setContractAddress(address) {
    this.contractAddress = address;
    if (this.adminWallet) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        contractABI,
        this.adminWallet
      );
      console.log("✅ Contract address updated and contract initialized");
    } else {
      console.warn(
        "⚠️  Contract address updated but no admin wallet available for write operations"
      );
    }
  }

  // Create a new election
  async createElection(name, description, startTime, endTime) {
    try {
      if (!this.adminWallet) {
        return {
          success: false,
          error:
            "Admin wallet not configured. Please set PRIVATE_KEY in environment variables.",
        };
      }

      if (!this.contract) {
        return {
          success: false,
          error:
            "Smart contract not initialized. Please deploy the contract first.",
        };
      }

      const tx = await this.contract.createElection(
        name,
        description,
        startTime,
        endTime
      );
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        electionId: await this.contract.getTotalElections(),
      };
    } catch (error) {
      console.error("Error creating election:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Register a candidate
  async registerCandidate(
    electionId,
    fullName,
    position,
    candidateId,
    candidateWallet
  ) {
    try {
      const candidateContract = this.contract.connect(candidateWallet);
      const fee = await this.contract.candidateRegistrationFee();

      const tx = await candidateContract.registerCandidate(
        electionId,
        fullName,
        position,
        candidateId,
        { value: fee }
      );

      const receipt = await tx.wait();
      // Parse CandidateRegistered event for candidateId
      let blockchainCandidateId = null;
      for (const event of receipt.logs) {
        try {
          const parsed = this.contract.interface.parseLog(event);
          if (parsed.name === "CandidateRegistered") {
            blockchainCandidateId = parsed.args.candidateId.toString();
            break;
          }
        } catch (e) {}
      }
      return {
        success: true,
        transactionHash: receipt.hash,
        blockchainCandidateId,
      };
    } catch (error) {
      console.error("Error registering candidate:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Register a voter
  async registerVoter(voterWallet) {
    try {
      const voterContract = this.contract.connect(voterWallet);
      const fee = await this.contract.registrationFee();

      const tx = await voterContract.registerVoter({ value: fee });
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error registering voter:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Cast a vote
  async castVote(electionId, candidateId, voterWallet) {
    try {
      const voterContract = this.contract.connect(voterWallet);

      const tx = await voterContract.vote(electionId, candidateId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error casting vote:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Complete an election
  async completeElection(electionId) {
    try {
      if (!this.adminWallet) {
        return {
          success: false,
          error:
            "Admin wallet not configured. Please set PRIVATE_KEY in environment variables.",
        };
      }

      if (!this.contract) {
        return {
          success: false,
          error:
            "Smart contract not initialized. Please deploy the contract first.",
        };
      }

      const tx = await this.contract.completeElection(electionId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error) {
      console.error("Error completing election:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get election results
  async getElectionResults(electionId) {
    try {
      console.log(
        `[Blockchain] Querying smart contract for election results, electionId: ${electionId}`
      );
      const results = await this.contract.getElectionResults(electionId);
      return {
        success: true,
        results: {
          positions: results[0],
          winnerNames: results[1],
          winningVoteCounts: results[2],
          isTied: results[3],
          resultHashes: results[4],
        },
      };
    } catch (error) {
      console.error("Error getting election results:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get candidate information
  async getCandidate(electionId, candidateId) {
    try {
      const candidate = await this.contract.getCandidate(
        electionId,
        candidateId
      );
      return {
        success: true,
        candidate: {
          id: candidate[0],
          fullName: candidate[1],
          position: candidate[2],
          voteCount: candidate[3],
          isActive: candidate[4],
          registrationTime: candidate[5],
          voteHash: candidate[6],
        },
      };
    } catch (error) {
      console.error("Error getting candidate:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get voter information
  async getVoter(voterAddress) {
    try {
      const voter = await this.contract.getVoter(voterAddress);
      return {
        success: true,
        voter: {
          isRegistered: voter[0],
          registrationTime: voter[1],
          voterHash: voter[2],
        },
      };
    } catch (error) {
      console.error("Error getting voter:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check if voter has voted for a position
  async hasVoterVotedForPosition(electionId, voterAddress, position) {
    try {
      const hasVoted = await this.contract.hasVoterVotedForPosition(
        electionId,
        voterAddress,
        position
      );
      return {
        success: true,
        hasVoted,
      };
    } catch (error) {
      console.error("Error checking voter vote:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get active elections
  async getActiveElections() {
    try {
      const elections = await this.contract.getActiveElections();
      return {
        success: true,
        elections: {
          ids: elections[0],
          names: elections[1],
          descriptions: elections[2],
          startTimes: elections[3],
          endTimes: elections[4],
        },
      };
    } catch (error) {
      console.error("Error getting active elections:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get predefined positions
  async getPredefinedPositions() {
    try {
      const positions = await this.contract.getPredefinedPositions();
      return {
        success: true,
        positions,
      };
    } catch (error) {
      console.error("Error getting predefined positions:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Create a wallet for a user
  createWallet() {
    return ethers.Wallet.createRandom();
  }

  // Get wallet from private key
  getWalletFromPrivateKey(privateKey) {
    return new ethers.Wallet(privateKey, this.provider);
  }

  // Get wallet from Hardhat account address (for local dev only)
  getWalletFromAccountAddress(accountAddress) {
    // Map of Hardhat addresses to their private keys (for local dev)
    const hardhatAccounts = [
      // Replace with your actual Hardhat private keys and addresses
      // Example:
      // { address: '0x...', privateKey: '0x...' },
    ];
    const entry = hardhatAccounts.find(
      (acc) => acc.address.toLowerCase() === accountAddress.toLowerCase()
    );
    if (entry) {
      return new ethers.Wallet(entry.privateKey, this.provider);
    }
    return null;
  }
}

module.exports = new BlockchainService();
