const { ethers } = require("ethers");
require("dotenv").config();

async function testWallet() {
  try {
    // Initialize provider
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");

    // Admin private key from Hardhat Account #0
    const privateKey =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const adminWallet = new ethers.Wallet(privateKey, provider);

    console.log("Admin wallet address:", adminWallet.address);

    // Check balance
    const balance = await provider.getBalance(adminWallet.address);
    console.log("Admin wallet balance:", ethers.formatEther(balance), "ETH");

    // Check if we can connect to the contract
    const contractAddress = process.env.CONTRACT_ADDRESS;
    console.log("Contract address:", contractAddress);

    // Try to get contract info
    const code = await provider.getCode(contractAddress);
    console.log("Contract deployed:", code !== "0x");

    if (code !== "0x") {
      console.log("✅ Contract is deployed and accessible");
    } else {
      console.log("❌ Contract not found at this address");
    }
  } catch (error) {
    console.error("Error testing wallet:", error);
  }
}

testWallet();
