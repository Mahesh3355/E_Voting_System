const mongoose = require("mongoose");
require("dotenv").config();
const { Voter } = require("./models"); // Use shared model import

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/voting_system")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test voter data
const testVoters = [
  {
    fullName: "John Doe",
    registrationNumber: "2024001",
    email: "john.doe@example.com",
    degree: "B.Tech Computer Science",
    walletAddress: "",
    privateKey: "",
    isBlockchainRegistered: false,
  },
  {
    fullName: "Jane Smith",
    registrationNumber: "2024002",
    email: "jane.smith@example.com",
    degree: "B.Tech Information Technology",
    walletAddress: "",
    privateKey: "",
    isBlockchainRegistered: false,
  },
  {
    fullName: "Bob Johnson",
    registrationNumber: "2024003",
    email: "bob.johnson@example.com",
    degree: "B.Tech Electronics",
    walletAddress: "",
    privateKey: "",
    isBlockchainRegistered: false,
  },
];

async function createTestVoters() {
  try {
    console.log("🔧 Creating test voters...\n");

    for (const voterData of testVoters) {
      // Check if voter already exists
      const existingVoter = await Voter.findOne({ email: voterData.email });

      if (existingVoter) {
        console.log(`⚠️  Voter ${voterData.email} already exists`);
        continue;
      }

      // Create new voter
      const voter = new Voter(voterData);
      await voter.save();

      console.log(
        `✅ Created voter: ${voterData.fullName} (${voterData.email})`
      );
    }

    // Display all voters
    console.log("\n📋 All registered voters:");
    const allVoters = await Voter.find({});
    allVoters.forEach((voter, index) => {
      console.log(
        `${index + 1}. ${voter.fullName} - ${voter.email} - ${
          voter.registrationNumber
        }`
      );
    });

    console.log(`\n🎉 Total voters in database: ${allVoters.length}`);
  } catch (error) {
    console.error("❌ Error creating test voters:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the script
createTestVoters();
