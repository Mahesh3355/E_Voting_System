import { ethers } from "hardhat";

async function main() {
  console.log("Starting VotingSystem interaction demo...");

  // Get signers
  const [owner, voter1, voter2, candidate1, candidate2] = await ethers.getSigners();
  
  console.log("Owner:", owner.address);
  console.log("Voter 1:", voter1.address);
  console.log("Voter 2:", voter2.address);
  console.log("Candidate 1:", candidate1.address);
  console.log("Candidate 2:", candidate2.address);

  // Deploy contract
  const VotingSystem = await ethers.getContractFactory("VotingSystem");
  const votingSystem = await VotingSystem.deploy();
  await votingSystem.waitForDeployment();
  
  const contractAddress = await votingSystem.getAddress();
  console.log(`\nVotingSystem deployed to: ${contractAddress}`);

  // Create an election
  const startTime = Math.floor(Date.now() / 1000) + 60; // Start in 1 minute
  const endTime = startTime + 3600; // End in 1 hour
  
  console.log("\nCreating election...");
  await votingSystem.createElection(
    "Student Council Election 2024",
    "Annual student council election for the upcoming academic year",
    startTime,
    endTime
  );
  console.log("Election created successfully!");

  // Register voters
  const voterFee = await votingSystem.registrationFee();
  console.log(`\nRegistering voters (Fee: ${ethers.formatEther(voterFee)} ETH)...`);
  
  await votingSystem.connect(voter1).registerVoter({ value: voterFee });
  await votingSystem.connect(voter2).registerVoter({ value: voterFee });
  console.log("Voters registered successfully!");

  // Register candidates
  const candidateFee = await votingSystem.candidateRegistrationFee();
  console.log(`\nRegistering candidates (Fee: ${ethers.formatEther(candidateFee)} ETH)...`);
  
  await votingSystem.connect(candidate1).registerCandidate(
    1,
    "Alice Johnson",
    "Progressive Students",
    "President",
    "QmHashAlice123",
    { value: candidateFee }
  );
  
  await votingSystem.connect(candidate2).registerCandidate(
    1,
    "Bob Smith",
    "Conservative Students",
    "President",
    "QmHashBob456",
    { value: candidateFee }
  );
  console.log("Candidates registered successfully!");

  // Wait for election to start
  console.log("\nWaiting for election to start...");
  await new Promise(resolve => setTimeout(resolve, 70000)); // Wait 70 seconds

  // Cast votes
  console.log("\nCasting votes...");
  await votingSystem.connect(voter1).vote(1, 1);
  await votingSystem.connect(voter2).vote(1, 2);
  console.log("Votes cast successfully!");

  // Get results
  console.log("\nGetting election results...");
  const results = await votingSystem.getElectionResults(1);
  
  console.log("\n=== ELECTION RESULTS ===");
  for (let i = 0; i < results.length; i++) {
    const candidate = results[i];
    console.log(`${candidate.name} (${candidate.party}): ${candidate.voteCount} votes`);
  }

  // Get election details
  const election = await votingSystem.getElection(1);
  console.log(`\nTotal votes cast: ${election.totalVotes}`);
  console.log(`Election status: ${election.isActive ? "Active" : "Inactive"}`);

  // Get voter details
  const voter1Details = await votingSystem.getVoter(voter1.address);
  console.log(`\nVoter 1 details:`);
  console.log(`- Registered: ${voter1Details.isRegistered}`);
  console.log(`- Has voted: ${voter1Details.hasVoted}`);
  console.log(`- Voted for candidate ID: ${voter1Details.votedFor}`);

  console.log("\nDemo completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 