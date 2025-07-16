const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function deployContract() {
  try {
    console.log("Starting contract deployment...");

    // Load contract ABI and bytecode
    const contractPath = path.join(
      __dirname,
      "../contracts/artifacts/contracts/VotingSystem.sol/VotingSystem.json"
    );
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(
      process.env.RPC_URL || "http://localhost:8545"
    );

    // Initialize wallet
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not found in environment variables");
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("Deploying from address:", wallet.address);

    // Create contract factory
    const contractFactory = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      wallet
    );

    // Deploy contract
    console.log("Deploying contract...");
    const contract = await contractFactory.deploy();

    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("Contract deployed successfully!");
    console.log("Contract address:", contractAddress);

    // Save contract address to .env file
    const envPath = path.join(__dirname, ".env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Update or add CONTRACT_ADDRESS
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("Contract address saved to .env file");

    // Verify contract deployment
    const deployedContract = new ethers.Contract(
      contractAddress,
      contractArtifact.abi,
      provider
    );

    // Test basic contract functions
    const positions = await deployedContract.getPredefinedPositions();
    console.log("Predefined positions:", positions);

    const registrationFee = await deployedContract.registrationFee();
    console.log(
      "Registration fee:",
      ethers.formatEther(registrationFee),
      "ETH"
    );

    const candidateFee = await deployedContract.candidateRegistrationFee();
    console.log(
      "Candidate registration fee:",
      ethers.formatEther(candidateFee),
      "ETH"
    );

    console.log("Contract deployment and verification completed successfully!");

    return contractAddress;
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

// Run deployment if this file is executed directly
if (require.main === module) {
  deployContract()
    .then((address) => {
      console.log("Deployment completed. Contract address:", address);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = deployContract;
