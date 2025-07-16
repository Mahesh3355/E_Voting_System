import { ethers } from "ethers";
import VotingSystemABI from "../artifacts/contracts/VotingSystem.sol/VotingSystem.json";

export interface Election {
  id: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isCompleted: boolean;
  totalVotes: number;
  totalCandidates: number;
}

export interface Candidate {
  id: number;
  name: string;
  party: string;
  position: string;
  imageHash: string;
  voteCount: number;
  isActive: boolean;
  registrationTime: number;
}

export interface Voter {
  isRegistered: boolean;
  hasVoted: boolean;
  votedFor: number;
  registrationTime: number;
}

export class VotingSystemContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(contractAddress: string, signer: ethers.Signer) {
    this.contract = new ethers.Contract(contractAddress, VotingSystemABI.abi, signer);
    this.signer = signer;
  }

  // Election Management
  async createElection(
    name: string,
    description: string,
    startTime: number,
    endTime: number
  ): Promise<ethers.ContractTransaction> {
    return await this.contract.createElection(name, description, startTime, endTime);
  }

  async getElection(electionId: number): Promise<Election> {
    const election = await this.contract.getElection(electionId);
    return {
      id: Number(election.id),
      name: election.name,
      description: election.description,
      startTime: Number(election.startTime),
      endTime: Number(election.endTime),
      isActive: election.isActive,
      isCompleted: election.isCompleted,
      totalVotes: Number(election.totalVotes),
      totalCandidates: Number(election.totalCandidates),
    };
  }

  async getActiveElections(): Promise<Election[]> {
    const elections = await this.contract.getActiveElections();
    return elections.map((election: any) => ({
      id: Number(election.id),
      name: election.name,
      description: election.description,
      startTime: Number(election.startTime),
      endTime: Number(election.endTime),
      isActive: election.isActive,
      isCompleted: election.isCompleted,
      totalVotes: Number(election.totalVotes),
      totalCandidates: Number(election.totalCandidates),
    }));
  }

  // Candidate Management
  async registerCandidate(
    electionId: number,
    name: string,
    party: string,
    position: string,
    imageHash: string,
    fee: string
  ): Promise<ethers.ContractTransaction> {
    const feeWei = ethers.parseEther(fee);
    return await this.contract.registerCandidate(
      electionId,
      name,
      party,
      position,
      imageHash,
      { value: feeWei }
    );
  }

  async getCandidate(electionId: number, candidateId: number): Promise<Candidate> {
    const candidate = await this.contract.getCandidate(electionId, candidateId);
    return {
      id: Number(candidate.id),
      name: candidate.name,
      party: candidate.party,
      position: candidate.position,
      imageHash: candidate.imageHash,
      voteCount: Number(candidate.voteCount),
      isActive: candidate.isActive,
      registrationTime: Number(candidate.registrationTime),
    };
  }

  async getElectionResults(electionId: number): Promise<Candidate[]> {
    const results = await this.contract.getElectionResults(electionId);
    return results.map((candidate: any) => ({
      id: Number(candidate.id),
      name: candidate.name,
      party: candidate.party,
      position: candidate.position,
      imageHash: candidate.imageHash,
      voteCount: Number(candidate.voteCount),
      isActive: candidate.isActive,
      registrationTime: Number(candidate.registrationTime),
    }));
  }

  // Voter Management
  async registerVoter(fee: string): Promise<ethers.ContractTransaction> {
    const feeWei = ethers.parseEther(fee);
    return await this.contract.registerVoter({ value: feeWei });
  }

  async getVoter(address: string): Promise<Voter> {
    const voter = await this.contract.getVoter(address);
    return {
      isRegistered: voter.isRegistered,
      hasVoted: voter.hasVoted,
      votedFor: Number(voter.votedFor),
      registrationTime: Number(voter.registrationTime),
    };
  }

  async vote(electionId: number, candidateId: number): Promise<ethers.ContractTransaction> {
    return await this.contract.vote(electionId, candidateId);
  }

  // Fee Management
  async getRegistrationFee(): Promise<string> {
    const fee = await this.contract.registrationFee();
    return ethers.formatEther(fee);
  }

  async getCandidateRegistrationFee(): Promise<string> {
    const fee = await this.contract.candidateRegistrationFee();
    return ethers.formatEther(fee);
  }

  async updateFees(registrationFee: string, candidateFee: string): Promise<ethers.ContractTransaction> {
    const regFeeWei = ethers.parseEther(registrationFee);
    const candFeeWei = ethers.parseEther(candidateFee);
    return await this.contract.updateFees(regFeeWei, candFeeWei);
  }

  // Admin Functions
  async completeElection(electionId: number): Promise<ethers.ContractTransaction> {
    return await this.contract.completeElection(electionId);
  }

  async withdrawFees(): Promise<ethers.ContractTransaction> {
    return await this.contract.withdrawFees();
  }

  async emergencyStopElection(electionId: number): Promise<ethers.ContractTransaction> {
    return await this.contract.emergencyStopElection(electionId);
  }

  async removeCandidate(electionId: number, candidateId: number): Promise<ethers.ContractTransaction> {
    return await this.contract.removeCandidate(electionId, candidateId);
  }

  // Utility Functions
  async getTotalElections(): Promise<number> {
    return Number(await this.contract.getTotalElections());
  }

  async getTotalCandidates(): Promise<number> {
    return Number(await this.contract.getTotalCandidates());
  }

  // Event Listeners
  onElectionCreated(callback: (electionId: number, name: string, startTime: number, endTime: number) => void) {
    this.contract.on("ElectionCreated", callback);
  }

  onCandidateRegistered(callback: (electionId: number, candidateId: number, name: string, party: string) => void) {
    this.contract.on("CandidateRegistered", callback);
  }

  onVoterRegistered(callback: (voter: string, registrationTime: number) => void) {
    this.contract.on("VoterRegistered", callback);
  }

  onVoteCast(callback: (electionId: number, voter: string, candidateId: number) => void) {
    this.contract.on("VoteCast", callback);
  }

  onElectionCompleted(callback: (electionId: number, totalVotes: number) => void) {
    this.contract.on("ElectionCompleted", callback);
  }

  // Remove all listeners
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// Helper function to connect to MetaMask
export async function connectToMetaMask(): Promise<ethers.BrowserProvider> {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    return new ethers.BrowserProvider(window.ethereum);
  } catch (error) {
    throw new Error("Failed to connect to MetaMask");
  }
}

// Helper function to get contract instance
export async function getVotingSystemContract(
  contractAddress: string
): Promise<VotingSystemContract> {
  const provider = await connectToMetaMask();
  const signer = await provider.getSigner();
  return new VotingSystemContract(contractAddress, signer);
}

// Helper function to format time
export function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Helper function to check if election is active
export function isElectionActive(election: Election): boolean {
  const now = Math.floor(Date.now() / 1000);
  return election.isActive && now >= election.startTime && now <= election.endTime;
}

// Helper function to get election status
export function getElectionStatus(election: Election): string {
  if (election.isCompleted) return "Completed";
  if (!election.isActive) return "Inactive";
  
  const now = Math.floor(Date.now() / 1000);
  if (now < election.startTime) return "Upcoming";
  if (now > election.endTime) return "Ended";
  return "Active";
} 