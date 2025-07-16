const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

console.log("🔧 Blockchain Voting System Environment Setup\n");

// Check if .env file already exists
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  console.log(
    "⚠️  .env file already exists. This script will not overwrite it."
  );
  console.log(
    "   If you want to regenerate, please delete the existing .env file first.\n"
  );
  process.exit(0);
}

// Generate a sample private key for development
const generatePrivateKey = () => {
  return "0x" + crypto.randomBytes(32).toString("hex");
};

// Create .env content
const envContent = `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/voting_system

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Blockchain Configuration
# For local development (Hardhat node)
RPC_URL=http://localhost:8545
PRIVATE_KEY=${generatePrivateKey()}
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
# CONTRACT_ADDRESS will be set after deployment

# For testnet (Sepolia)
# RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
# PRIVATE_KEY=your-sepolia-private-key-here
# CONTRACT_ADDRESS=your-deployed-contract-address

# For mainnet (Production)
# RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
# PRIVATE_KEY=your-mainnet-private-key-here
# CONTRACT_ADDRESS=your-deployed-contract-address

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# IMPORTANT NOTES:
# 1. PRIVATE_KEY must be a 64-character hex string (without 0x prefix is also valid)
# 2. Never commit your actual private keys to version control
# 3. For development, you can generate a test private key using: node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
# 4. CONTRACT_ADDRESS will be provided after deploying the smart contract
`;

// Write .env file
fs.writeFileSync(envPath, envContent);

console.log("✅ .env file created successfully!");
console.log("\n📝 Next steps:");
console.log(
  "1. Update the EMAIL_USER and EMAIL_PASS with your Gmail credentials"
);
console.log("2. Deploy the smart contract to get the CONTRACT_ADDRESS");
console.log("3. Update the CONTRACT_ADDRESS in the .env file");
console.log("4. Start the backend server with: npm start");
console.log("\n🔐 Security Notes:");
console.log("- The generated PRIVATE_KEY is for development only");
console.log(
  "- For production, use a real private key from MetaMask or hardware wallet"
);
console.log("- Never share or commit your private keys");
console.log("\n�� Ready to start!");
