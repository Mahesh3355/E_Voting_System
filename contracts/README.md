# Blockchain Voting System - Smart Contracts

A decentralized voting system built on Ethereum using Solidity smart contracts and Hardhat development framework. This system is optimized for student council elections with predefined positions and minimal gas consumption.

## Features
- Secure, immutable, and transparent voting records on Ethereum blockchain
- 5 Predefined Positions: Vice-president, GS(GYMKHANA), GS(CULTURAL), GS(SPORTS), GS(TECHNICAL)
- Position-based voting (one vote per position per voter)
- Real-time results with tie handling
- Admin controls: create/complete elections, update fees, emergency stop, withdraw fees
- Candidate/voter registration with fees
- Event system for frontend updates
- Gas-optimized and secure (Ownable, ReentrancyGuard)

## Installation & Setup

### 1. Install dependencies
```bash
cd contracts
npm install
```

### 2. Set up environment variables
Copy the example file and edit as needed:
```bash
cp env.example .env
# Edit .env with your configuration
```

Example `.env`:
```
PRIVATE_KEY=your-private-key-here
RPC_URL=http://localhost:8545
```

### 3. Compile contracts
```bash
npm run compile
```

### 4. Deploy contracts
- **Local Hardhat node:**
  ```bash
  npm run node
  npm run deploy
  ```
- **Testnet (e.g., Sepolia):**
  ```bash
  npm run deploy:sepolia
  ```
- **Mainnet:**
  ```bash
  npm run deploy:mainnet
  ```

### 5. Run tests
```bash
npm run test
```

### 6. Integration with Backend
- After deployment, copy the contract address to your backend `.env` as `CONTRACT_ADDRESS`.
- The backend uses this address to interact with the contract for all voting operations.

## Development Workflow
- Start local Hardhat node: `npm run node`
- Deploy contract: `npm run deploy`
- Start backend: see backend/README.md
- Start frontend: see final/admin/README.md

## Troubleshooting
- **Private key errors:** Ensure your `.env` has a valid private key.
- **RPC errors:** Make sure your RPC URL is correct and the node is running.
- **Contract not found:** Deploy the contract and update the backend `.env` with the correct address.
- **BigInt serialization:** The backend will convert all BigInt values to strings before saving to MongoDB.

## Project Structure
```
contracts/
├── contracts/
│   └── VotingSystem.sol      # Main smart contract
├── scripts/
│   ├── deploy.ts            # Deployment script
│   └── interact.ts          # Interaction demo
├── test/
│   └── VotingSystem.test.ts # Contract tests
├── utils/
│   └── contractHelpers.ts   # Contract helper functions
├── hardhat.config.ts        # Hardhat config
├── package.json
├── env.example
└── README.md
```

## Frontend Integration Example
```typescript
import { getVotingSystemContract } from "./utils/contractHelpers";

// Connect to contract
const contract = await getVotingSystemContract(contractAddress);

// Get predefined positions
const positions = await contract.getPredefinedPositions();

// Get active elections
const elections = await contract.getActiveElections();

// Register voter
const fee = await contract.getRegistrationFee();
await contract.registerVoter(fee);

// Vote for a candidate
await contract.vote(electionId, candidateId);

// Get results by position
const results = await contract.getElectionResults(electionId);
```

## Learn More
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [Ethers.js Docs](https://docs.ethers.org/)
