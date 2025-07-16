import { expect } from "chai";
import { ethers } from "hardhat";
import { VotingSystem } from "../typechain-types";

describe("VotingSystem", function () {
  let votingSystem: VotingSystem;
  let owner: any;
  let voter1: any;
  let voter2: any;
  let voter3: any;
  let candidate1: any;
  let candidate2: any;
  let candidate3: any;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, candidate1, candidate2, candidate3] = await ethers.getSigners();
    
    const VotingSystemFactory = await ethers.getContractFactory("VotingSystem");
    votingSystem = await VotingSystemFactory.deploy();
  });

  describe("Basic Setup", function () {
    it("Should initialize with correct predefined positions", async function () {
      const positions = await votingSystem.getPredefinedPositions();
      expect(positions).to.deep.equal([
        "Vice-president",
        "GS(GYMKHANA)",
        "GS(CULTURAL)",
        "GS(SPORTS)",
        "GS(TECHNICAL)"
      ]);
    });

    it("Should allow owner to create election", async function () {
      const startTime = Math.floor(Date.now() / 1000) + 60; // 1 minute from now
      const endTime = startTime + 3600; // 1 hour later
      
      await expect(votingSystem.createElection(
        "Student Council Election 2024",
        "Annual student council election",
        startTime,
        endTime
      )).to.emit(votingSystem, "ElectionCreated");
    });
  });

  describe("Candidate Registration with SHA256", function () {
    it("Should register candidates with vote hashes", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = currentBlock!.timestamp + 300; // 5 minutes from current block
      const endTime = startTime + 3600;
      await votingSystem.createElection("Test Election", "Test", startTime, endTime);
      const tx = await votingSystem.connect(candidate1).registerCandidate(
        1, "John Doe", "Vice-president", 1000001, { value: ethers.parseEther("0.05") }
      );
      const receipt = await tx.wait();
      const event = receipt!.logs.map(log => votingSystem.interface.parseLog(log)).find(e => e.name === "CandidateRegistered");
      expect(event).to.not.be.undefined;
      const voteHashFromEvent = event!.args.voteHash;
      const candidate = await votingSystem.getCandidate(1, 1000001);
      expect(candidate.voteHash).to.equal(voteHashFromEvent);
      expect(candidate.voteHash).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("Voter Registration with SHA256", function () {
    it("Should register voters with voter hashes", async function () {
      const tx = await votingSystem.connect(voter1).registerVoter({ value: ethers.parseEther("0.01") });
      const receipt = await tx.wait();
      const event = receipt!.logs.map(log => votingSystem.interface.parseLog(log)).find(e => e.name === "VoterRegistered");
      expect(event).to.not.be.undefined;
      const voterHashFromEvent = event!.args.voterHash;
      const voter = await votingSystem.getVoter(voter1.address);
      expect(voter.voterHash).to.equal(voterHashFromEvent);
      expect(voter.voterHash).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("Voting and Results", function () {
    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = currentBlock!.timestamp + 300; // 5 minutes from current block
      const endTime = startTime + 3600;
      await votingSystem.createElection("Test Election", "Test", startTime, endTime);
      
      await votingSystem.connect(candidate1).registerCandidate(
        1, "John Doe", "Vice-president", 1000001, { value: ethers.parseEther("0.05") }
      );
      await votingSystem.connect(candidate2).registerCandidate(
        1, "Jane Smith", "Vice-president", 1000002, { value: ethers.parseEther("0.05") }
      );
      await votingSystem.connect(candidate3).registerCandidate(
        1, "Bob Johnson", "GS(GYMKHANA)", 1000003, { value: ethers.parseEther("0.05") }
      );
      
      await votingSystem.connect(voter1).registerVoter({ value: ethers.parseEther("0.01") });
      await votingSystem.connect(voter2).registerVoter({ value: ethers.parseEther("0.01") });
      await votingSystem.connect(voter3).registerVoter({ value: ethers.parseEther("0.01") });
    });

    it("Should allow voting and track votes correctly", async function () {
      await ethers.provider.send("evm_increaseTime", [360]); // 6 minutes to ensure election has started
      await ethers.provider.send("evm_mine", []);
      await votingSystem.connect(voter1).vote(1, 1000001); // John Doe for Vice-president
      await votingSystem.connect(voter2).vote(1, 1000001); // John Doe for Vice-president
      await votingSystem.connect(voter3).vote(1, 1000002); // Jane Smith for Vice-president
      const candidate1Data = await votingSystem.getCandidate(1, 1000001);
      const candidate2Data = await votingSystem.getCandidate(1, 1000002);
      expect(candidate1Data.voteCount).to.equal(2);
      expect(candidate2Data.voteCount).to.equal(1);
    });

    it("Should show maximum vote candidates for each position and expose result hashes", async function () {
      await ethers.provider.send("evm_increaseTime", [360]); // 6 minutes to ensure election has started
      await ethers.provider.send("evm_mine", []);
      await votingSystem.connect(voter1).vote(1, 1000001);
      await votingSystem.connect(voter2).vote(1, 1000001);
      await votingSystem.connect(voter3).vote(1, 1000002);
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      const [positions, winnerNames, winningVoteCounts, isTied, resultHashes] = await votingSystem.getElectionResults(1);
      // Find Vice-president result
      let idx = positions.findIndex((p: string) => p === "Vice-president");
      expect(idx).to.not.equal(-1);
      expect(winnerNames[idx]).to.include("John Doe");
      expect(winnerNames[idx]).to.not.include("Jane Smith");
      expect(winningVoteCounts[idx]).to.equal(2);
      expect(isTied[idx]).to.be.false;
      expect(resultHashes[idx]).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });

    it("Should handle ties correctly", async function () {
      await ethers.provider.send("evm_increaseTime", [360]); // 6 minutes to ensure election has started
      await ethers.provider.send("evm_mine", []);
      // Vote - Both candidates get 1 vote each (tie)
      await votingSystem.connect(voter1).vote(1, 1000001);
      await votingSystem.connect(voter2).vote(1, 1000002);
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      const [positions, winnerNames, winningVoteCounts, isTied, resultHashes] = await votingSystem.getElectionResults(1);
      // Find Vice-president result
      let idx = positions.findIndex((p: string) => p === "Vice-president");
      expect(idx).to.not.equal(-1);
      expect(winnerNames[idx]).to.include("John Doe");
      expect(winnerNames[idx]).to.include("Jane Smith");
      expect(winningVoteCounts[idx]).to.equal(1);
      expect(isTied[idx]).to.be.true;
      expect(resultHashes[idx]).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });

    it("Should get winner for specific position and expose result hash", async function () {
      await ethers.provider.send("evm_increaseTime", [360]); // 6 minutes to ensure election has started
      await ethers.provider.send("evm_mine", []);
      await votingSystem.connect(voter1).vote(1, 1000001);
      await votingSystem.connect(voter2).vote(1, 1000001);
      await votingSystem.connect(voter3).vote(1, 1000002);
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      const [winnerNames, winningVoteCount, isTied, resultHash] = await votingSystem.getPositionWinner(1, "Vice-president");
      expect(winnerNames).to.include("John Doe");
      expect(winnerNames).to.not.include("Jane Smith");
      expect(winningVoteCount).to.equal(2);
      expect(isTied).to.be.false;
      expect(resultHash).to.not.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("SHA256 Hash Verification", function () {
    it("Should generate unique hashes for different data", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = currentBlock!.timestamp + 300; // 5 minutes from current block
      const endTime = startTime + 3600;
      await votingSystem.createElection("Test Election", "Test", startTime, endTime);
      // Register two different candidates
      await votingSystem.connect(candidate1).registerCandidate(
        1, "John Doe", "Vice-president", 1000001, { value: ethers.parseEther("0.05") }
      );
      await votingSystem.connect(candidate2).registerCandidate(
        1, "Jane Smith", "Vice-president", 1000002, { value: ethers.parseEther("0.05") }
      );
      const candidate1Data = await votingSystem.getCandidate(1, 1000001);
      const candidate2Data = await votingSystem.getCandidate(1, 1000002);
      // Hashes should be different for different candidates
      expect(candidate1Data.voteHash).to.not.equal(candidate2Data.voteHash);
    });

    it("Should generate unique hashes for different voters", async function () {
      await votingSystem.connect(voter1).registerVoter({ value: ethers.parseEther("0.01") });
      await votingSystem.connect(voter2).registerVoter({ value: ethers.parseEther("0.01") });
      const voter1Data = await votingSystem.getVoter(voter1.address);
      const voter2Data = await votingSystem.getVoter(voter2.address);
      // Hashes should be different for different voters
      expect(voter1Data.voterHash).to.not.equal(voter2Data.voterHash);
    });
  });

  describe("Gas Optimization", function () {
    it("Should use gas efficiently for vote operations", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = currentBlock!.timestamp + 300; // 5 minutes from current block
      const endTime = startTime + 3600;
      await votingSystem.createElection("Test Election", "Test", startTime, endTime);
      await votingSystem.connect(candidate1).registerCandidate(
        1, "John Doe", "Vice-president", 1000001, { value: ethers.parseEther("0.05") }
      );
      await votingSystem.connect(voter1).registerVoter({ value: ethers.parseEther("0.01") });
      // Fast forward time to start election
      await ethers.provider.send("evm_increaseTime", [360]); // 6 minutes to ensure election has started
      await ethers.provider.send("evm_mine", []);
      // Vote and check gas usage
      const tx = await votingSystem.connect(voter1).vote(1, 1000001);
      const receipt = await tx.wait();
      // Gas usage should be reasonable (less than 150k gas for a vote)
      expect(receipt!.gasUsed).to.be.lessThan(150000);
    });
  });

  describe("Election Data Reset", function () {
    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = currentBlock!.timestamp + 300; // 5 minutes from current block
      const endTime = startTime + 3600;
      await votingSystem.createElection("Test Election", "Test", startTime, endTime);
      await votingSystem.connect(candidate1).registerCandidate(
        1, "John Doe", "Vice-president", 1000001, { value: ethers.parseEther("0.05") }
      );
      await votingSystem.connect(candidate2).registerCandidate(
        1, "Jane Smith", "Vice-president", 1000002, { value: ethers.parseEther("0.05") }
      );
      await votingSystem.connect(voter1).registerVoter({ value: ethers.parseEther("0.01") });
      await votingSystem.connect(voter2).registerVoter({ value: ethers.parseEther("0.01") });
    });

    it("Should automatically reset previous election data when new election starts", async function () {
      // Vote in the first election
      await ethers.provider.send("evm_increaseTime", [360]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.connect(voter1).vote(1, 1000001);
      await votingSystem.connect(voter2).vote(1, 1000002);
      
      // Complete the first election
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      
      // Verify results are available
      const [positions, winnerNames, winningVoteCounts, isTied, resultHashes] = await votingSystem.getElectionResults(1);
      let idx = positions.findIndex((p: string) => p === "Vice-president");
      expect(winningVoteCounts[idx]).to.equal(1);
      
      // Create a new election (this should automatically reset the previous election data)
      const currentBlock = await ethers.provider.getBlock("latest");
      const nextStartTime = currentBlock!.timestamp + 300;
      const nextEndTime = nextStartTime + 3600;
      
      await votingSystem.createElection("Next Election", "Next Test", nextStartTime, nextEndTime);
      
      // Verify previous election data is automatically reset
      const candidate1Data = await votingSystem.getCandidate(1, 1000001);
      const candidate2Data = await votingSystem.getCandidate(1, 1000002);
      expect(candidate1Data.voteCount).to.equal(0);
      expect(candidate2Data.voteCount).to.equal(0);
      expect(candidate1Data.isActive).to.be.false;
      expect(candidate2Data.isActive).to.be.false;
      
      // Verify previous election is no longer completed
      const previousElection = await votingSystem.getElection(1);
      expect(previousElection.isCompleted).to.be.false;
      expect(previousElection.totalVotes).to.equal(0);
      
      // Verify new election is created properly
      const newElection = await votingSystem.getElection(2);
      expect(newElection.name).to.equal("Next Election");
      expect(newElection.isActive).to.be.true;
      expect(newElection.isCompleted).to.be.false;
      expect(newElection.totalVotes).to.equal(0);
    });

    it("Should not reset data if previous election is not completed", async function () {
      // Vote in the first election but don't complete it
      await ethers.provider.send("evm_increaseTime", [360]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.connect(voter1).vote(1, 1000001);
      
      // Create a new election without completing the first one
      const currentBlock = await ethers.provider.getBlock("latest");
      const nextStartTime = currentBlock!.timestamp + 300;
      const nextEndTime = nextStartTime + 3600;
      
      await votingSystem.createElection("Next Election", "Next Test", nextStartTime, nextEndTime);
      
      // Verify first election data is NOT reset (since it wasn't completed)
      const candidate1Data = await votingSystem.getCandidate(1, 1000001);
      expect(candidate1Data.voteCount).to.equal(1); // Should still have the vote
      expect(candidate1Data.isActive).to.be.true; // Should still be active
      
      const firstElection = await votingSystem.getElection(1);
      expect(firstElection.isActive).to.be.true; // Should still be active
    });

    it("Should allow manual reset of election data", async function () {
      // Vote in the election
      await ethers.provider.send("evm_increaseTime", [360]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.connect(voter1).vote(1, 1000001);
      
      // Complete the election
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      
      // Manually reset election data
      await votingSystem.resetElectionData(1);
      
      // Verify data is reset
      const candidate1Data = await votingSystem.getCandidate(1, 1000001);
      expect(candidate1Data.voteCount).to.equal(0);
      expect(candidate1Data.isActive).to.be.false;
      
      const election = await votingSystem.getElection(1);
      expect(election.isCompleted).to.be.false;
      expect(election.totalVotes).to.equal(0);
    });

    it("Should clear voter voting history", async function () {
      // Vote in the election
      await ethers.provider.send("evm_increaseTime", [360]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.connect(voter1).vote(1, 1000001);
      
      // Complete the election
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      
      // Verify voter has voted
      const hasVoted = await votingSystem.hasVoterVotedForPosition(1, voter1.address, "Vice-president");
      expect(hasVoted).to.be.true;
      
      // Clear voter voting history
      await votingSystem.clearVoterVotingHistory(1, voter1.address);
      
      // Verify voting history is cleared
      const hasVotedAfter = await votingSystem.hasVoterVotedForPosition(1, voter1.address, "Vice-president");
      expect(hasVotedAfter).to.be.false;
    });
  });

  describe("Edge Cases for Results", function () {
    it("Should revert when getting results for an empty election (no candidates)", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = currentBlock!.timestamp + 300;
      const endTime = startTime + 3600;
      await votingSystem.createElection("Empty Election", "No candidates", startTime, endTime);
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      await expect(votingSystem.getElectionResults(1)).to.be.revertedWith("No candidates for this election");
    });

    it("Should return zero votes for all candidates if no votes were cast", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = currentBlock!.timestamp + 300;
      const endTime = startTime + 3600;
      await votingSystem.createElection("No Votes Election", "No votes", startTime, endTime);
      await votingSystem.connect(candidate1).registerCandidate(
        1, "No Votes", "Vice-president", 1000001, { value: ethers.parseEther("0.05") }
      );
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      const [positions, winnerNames, winningVoteCounts, isTied, resultHashes] = await votingSystem.getElectionResults(1);
      expect(winningVoteCounts[0]).to.equal(0);
      expect(winnerNames[0]).to.deep.equal(["No Votes"]);
      expect(isTied[0]).to.be.false;
    });

    it("Should revert when getting results for a non-existent election (typo/invalid id)", async function () {
      await expect(votingSystem.getElectionResults(999)).to.be.revertedWith("Election does not exist");
    });

    it("Should revert when getting position winner for a typo/invalid position", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const startTime = currentBlock!.timestamp + 300;
      const endTime = startTime + 3600;
      await votingSystem.createElection("Test Election", "Test", startTime, endTime);
      await votingSystem.connect(candidate1).registerCandidate(
        1, "John Doe", "Vice-president", 1000001, { value: ethers.parseEther("0.05") }
      );
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine", []);
      await votingSystem.completeElection(1);
      await expect(votingSystem.getPositionWinner(1, "TypoPosition")).to.be.revertedWith("Invalid position. Only predefined positions are allowed");
    });
  });
}); 