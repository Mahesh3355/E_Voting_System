const fs = require("fs");
const path = require("path");
require("dotenv").config();

console.log("🔍 Environment Configuration Validation\n");

const envPath = path.join(__dirname, ".env");
let hasErrors = false;

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log("❌ .env file not found!");
  console.log("   Run: node setup-env.js to create one\n");
  process.exit(1);
}

console.log("✅ .env file found");

// Validate required environment variables
const requiredVars = [
  "MONGODB_URI",
  "EMAIL_USER",
  "EMAIL_PASS",
  "RPC_URL",
  "PRIVATE_KEY",
  "CONTRACT_ADDRESS",
  "NODE_ENV",
  "PORT",
  "FRONTEND_URL",
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_MAX_REQUESTS",
  "MAX_BATCH_SIZE",
  "MONGODB_RETRY_ATTEMPTS",
  "MONGODB_RETRY_INTERVAL",
];

const validations = {
  NODE_ENV: (value) => {
    if (!value || !["development", "production", "test"].includes(value)) {
      console.log(
        "❌ NODE_ENV: Must be 'development', 'production', or 'test'"
      );
      return false;
    }
    return true;
  },

  PORT: (value) => {
    const port = parseInt(value);
    if (!port || port < 1024 || port > 65535) {
      console.log("❌ PORT: Must be a valid port number (1024-65535)");
      return false;
    }
    return true;
  },

  FRONTEND_URL: (value) => {
    if (
      !value ||
      (!value.startsWith("http://") && !value.startsWith("https://"))
    ) {
      console.log(
        "❌ FRONTEND_URL: Must be a valid URL starting with http:// or https://"
      );
      return false;
    }
    return true;
  },

  RATE_LIMIT_WINDOW_MS: (value) => {
    const ms = parseInt(value);
    if (!ms || ms < 1000) {
      console.log(
        "❌ RATE_LIMIT_WINDOW_MS: Must be at least 1000 milliseconds"
      );
      return false;
    }
    return true;
  },

  RATE_LIMIT_MAX_REQUESTS: (value) => {
    const requests = parseInt(value);
    if (!requests || requests < 1) {
      console.log("❌ RATE_LIMIT_MAX_REQUESTS: Must be at least 1");
      return false;
    }
    return true;
  },

  MAX_BATCH_SIZE: (value) => {
    const size = parseInt(value);
    if (!size || size < 1 || size > 10) {
      console.log("❌ MAX_BATCH_SIZE: Must be between 1 and 10");
      return false;
    }
    return true;
  },

  MONGODB_RETRY_ATTEMPTS: (value) => {
    const attempts = parseInt(value);
    if (!attempts || attempts < 1 || attempts > 10) {
      console.log("❌ MONGODB_RETRY_ATTEMPTS: Must be between 1 and 10");
      return false;
    }
    return true;
  },

  MONGODB_RETRY_INTERVAL: (value) => {
    const interval = parseInt(value);
    if (!interval || interval < 1000 || interval > 30000) {
      console.log(
        "❌ MONGODB_RETRY_INTERVAL: Must be between 1000 and 30000 milliseconds"
      );
      return false;
    }
    return true;
  },

  MONGODB_URI: (value) => {
    if (!value || value === "mongodb://localhost:27017/voting_system") {
      console.log("⚠️  MONGODB_URI: Using default local MongoDB");
      return true;
    }
    return value.startsWith("mongodb://") || value.startsWith("mongodb+srv://");
  },

  EMAIL_USER: (value) => {
    if (!value || value === "your-email@gmail.com") {
      console.log("❌ EMAIL_USER: Please set your Gmail address");
      return false;
    }
    return value.includes("@gmail.com");
  },

  EMAIL_PASS: (value) => {
    if (!value || value === "your-app-password") {
      console.log("❌ EMAIL_PASS: Please set your Gmail app password");
      return false;
    }
    return value.length > 0;
  },

  RPC_URL: (value) => {
    if (!value) {
      console.log("❌ RPC_URL: Not set");
      return false;
    }
    return value.startsWith("http://") || value.startsWith("https://");
  },

  PRIVATE_KEY: (value) => {
    if (
      !value ||
      value ===
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    ) {
      console.log("❌ PRIVATE_KEY: Please set a valid private key");
      return false;
    }
    // Check if it's a valid hex string (with or without 0x prefix)
    const cleanKey = value.startsWith("0x") ? value.slice(2) : value;
    return /^[0-9a-fA-F]{64}$/.test(cleanKey);
  },

  CONTRACT_ADDRESS: (value) => {
    if (!value || value === "0x1234567890123456789012345678901234567890") {
      console.log("⚠️  CONTRACT_ADDRESS: Using placeholder address");
      console.log("   This will be updated after contract deployment");
      return true;
    }
    // Check if it's a valid Ethereum address
    return /^0x[a-fA-F0-9]{40}$/.test(value);
  },
};

console.log("\n📋 Validating environment variables:\n");

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const validator = validations[varName];

  if (validator(value)) {
    console.log(`✅ ${varName}: Valid`);
  } else {
    console.log(`❌ ${varName}: Invalid or missing`);
    hasErrors = true;
  }
});

console.log("\n🔧 Configuration Status:");

if (hasErrors) {
  console.log("❌ Some environment variables need to be configured");
  console.log("\n📝 To fix:");
  console.log("1. Update the .env file with proper values");
  console.log("2. For email setup, use Gmail app passwords");
  console.log("3. For private key, use MetaMask or generate a test key");
  console.log("4. For contract address, deploy the smart contract first");
  process.exit(1);
} else {
  console.log("✅ All environment variables are properly configured!");
  console.log("\n🚀 You can now start the backend server with: npm start");
}

console.log("\n💡 Tips:");
console.log("- Use Gmail app passwords, not your regular password");
console.log("- For development, you can use Hardhat's default accounts");
console.log("- For production, use hardware wallets or secure key management");
