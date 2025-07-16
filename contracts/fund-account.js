const { ethers } = require("hardhat");

async function main() {
  // Get the signers (accounts)
  const [deployer, account1, account2, account3, account4, account5] =
    await ethers.getSigners();

  // The admin private key from your backend
  const adminPrivateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const adminWallet = new ethers.Wallet(adminPrivateKey, ethers.provider);

  console.log("Funding admin account...");
  console.log("Admin address:", adminWallet.address);
  console.log("Deployer address:", deployer.address);

  // Check balances
  const adminBalance = await ethers.provider.getBalance(adminWallet.address);
  const deployerBalance = await ethers.provider.getBalance(deployer.address);

  console.log("Admin balance before:", ethers.formatEther(adminBalance), "ETH");
  console.log("Deployer balance:", ethers.formatEther(deployerBalance), "ETH");

  // Send 10 ETH to admin account
  const tx = await deployer.sendTransaction({
    to: adminWallet.address,
    value: ethers.parseEther("10"),
  });

  await tx.wait();

  const newAdminBalance = await ethers.provider.getBalance(adminWallet.address);
  console.log(
    "Admin balance after:",
    ethers.formatEther(newAdminBalance),
    "ETH"
  );
  console.log("✅ Admin account funded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
