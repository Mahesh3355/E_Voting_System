import { ethers } from 'ethers';
import axios from 'axios';

// Always use API_BASE_URL for backend API calls. Set NEXT_PUBLIC_API_URL in your .env.local to override.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Election {
  id: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  voteCount: number;
  isActive: boolean;
  walletAddress?: string;
  isBlockchainRegistered?: boolean;
}

export interface Voter {
  email: string;
  walletAddress?: string;
  isBlockchainRegistered?: boolean;
}

export interface ElectionResults {
  positions: string[];
  winnerNames: string[];
  winningVoteCounts: number[];
  isTied: boolean[];
  resultHashes: string[];
}

class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  // Initialize Web3 connection
  async connectWallet(): Promise<string> {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  // Get current wallet address
  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) {
      return null;
    }
    return await this.signer.getAddress();
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return this.signer !== null;
  }

  // API Methods for Backend Integration

  // Create election on blockchain
  async createElection(name: string, description: string, startTime: number, endTime: number) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/blockchain/create-election`, {
        name,
        description,
        startTime,
        endTime
      });
      return response.data;
    } catch (error) {
      console.error('Error creating election:', error);
      throw error;
    }
  }

  // Register voter on blockchain
  async registerVoter(email: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/blockchain/register-voter`, {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Error registering voter:', error);
      throw error;
    }
  }

  // Register candidate on blockchain
  async registerCandidate(candidateNumber: number, electionId: number) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/blockchain/register-candidate`, {
        candidateNumber,
        electionId
      });
      return response.data;
    } catch (error) {
      console.error('Error registering candidate:', error);
      throw error;
    }
  }

  // Cast vote on blockchain
  async castVote(accountAddress: string, candidateId: number, electionId: number) {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/blockchain/cast-vote`,
        {
          accountAddress,
          candidateId,
          electionId,
        }
      );
      return res.data;
    } catch (err: any) {
      return err.response?.data || { success: false, message: "Failed to cast vote." };
    }
  }

  // Get election results from blockchain
  async getElectionResults(electionId: number): Promise<ElectionResults> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/election-results/${electionId}`);
      return response.data.results;
    } catch (error) {
      console.error('Error getting election results:', error);
      throw error;
    }
  }

  // Complete election on blockchain
  async completeElection(electionId: number) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/blockchain/complete-election/${electionId}`);
      return response.data;
    } catch (error) {
      console.error('Error completing election:', error);
      throw error;
    }
  }

  // Get predefined positions from blockchain
  async getPredefinedPositions(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/positions`);
      return response.data.positions;
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  }

  // Get active elections from blockchain
  async getActiveElections(): Promise<Election[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/active-elections`);
      const elections = response.data.elections;
      
      // Transform the data to match our interface
      return elections.ids.map((id: number, index: number) => ({
        id: Number(id),
        name: elections.names[index],
        description: elections.descriptions[index],
        startTime: Number(elections.startTimes[index]),
        endTime: Number(elections.endTimes[index])
      }));
    } catch (error) {
      console.error('Error getting active elections:', error);
      throw error;
    }
  }

  // Get voter blockchain status
  async getVoterStatus(email: string): Promise<Voter> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/voter-status/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error getting voter status:', error);
      throw error;
    }
  }

  // Get candidate blockchain status
  async getCandidateStatus(candidateNumber: number): Promise<Candidate> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blockchain/candidate-status/${candidateNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error getting candidate status:', error);
      throw error;
    }
  }

  // Traditional API Methods (for non-blockchain operations)

  // Get approved candidates
  async getApprovedCandidates(position?: string): Promise<Candidate[]> {
    try {
      const params = position ? { position } : {};
      const response = await axios.get(`${API_BASE_URL}/api/candidate/approved`, { params });
      return response.data.candidates;
    } catch (error) {
      console.error('Error getting approved candidates:', error);
      throw error;
    }
  }

  // Get current election event
  async getCurrentEvent() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/current`);
      return response.data.event;
    } catch (error) {
      console.error('Error getting current event:', error);
      throw error;
    }
  }

  // Create election event
  async createElectionEvent(eventData: any) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/events/create`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating election event:', error);
      throw error;
    }
  }

  // Update candidate status
  async updateCandidateStatus(candidateNumber: number, status: 'approved' | 'rejected') {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/candidate/${candidateNumber}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating candidate status:', error);
      throw error;
    }
  }

  // Get pending candidates
  async getPendingCandidates(): Promise<Candidate[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/candidate/pending`);
      return response.data.candidates;
    } catch (error) {
      console.error('Error getting pending candidates:', error);
      throw error;
    }
  }

  // Utility Methods

  // Format timestamp to readable date
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  // Check if election is active
  isElectionActive(election: Election): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now >= election.startTime && now <= election.endTime;
  }

  // Check if election is in registration phase
  isRegistrationActive(election: Election): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now >= election.startTime && now <= election.endTime;
  }

  // Get election phase
  getElectionPhase(election: Election): 'upcoming' | 'registration' | 'voting' | 'completed' {
    const now = Math.floor(Date.now() / 1000);
    
    if (now < election.startTime) return 'upcoming';
    if (now >= election.startTime && now <= election.endTime) return 'voting';
    return 'completed';
  }

  // Get all elections (active and ended)
  async getAllElections(): Promise<Election[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/events/all`);
      const events = response.data.events;
      return events.map((event: any) => ({
        id: event.blockchainElectionId,
        name: event.title,
        description: '', // No description in event, can be extended if needed
        startTime: Math.floor(new Date(event.votingStart).getTime() / 1000),
        endTime: Math.floor(new Date(event.votingEnd).getTime() / 1000),
      }));
    } catch (error) {
      console.error('Error getting all elections:', error);
      throw error;
    }
  }

  // Verify transaction hash on blockchain
  async verifyTransactionHash(txHash: string) {
    try {
      // Initialize provider if not already connected
      if (!this.provider) {
        if (typeof window.ethereum !== 'undefined') {
          this.provider = new ethers.BrowserProvider(window.ethereum);
        } else {
          // For Hardhat, use the default provider
          this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
        }
      }

      // Get transaction details
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) {
        return {
          success: false,
          found: false,
          message: "Transaction not found on blockchain."
        };
      }

      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return {
          success: false,
          found: false,
          message: "Transaction receipt not found."
        };
      }

      // Check if transaction was successful
      const isSuccess = receipt.status === 1;

      return {
        success: true,
        found: true,
        isSuccess,
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString(),
          status: isSuccess ? "Success" : "Failed",
          timestamp: Date.now() // Note: For exact timestamp, you'd need to get block details
        },
        message: isSuccess ? "Transaction verified successfully!" : "Transaction failed on blockchain."
      };

    } catch (error) {
      console.error('Error verifying transaction:', error);
      return {
        success: false,
        found: false,
        message: "Error verifying transaction. Please check the hash and try again."
      };
    }
  }
}

// Create and export a singleton instance
const blockchainService = new BlockchainService();
export default blockchainService; 