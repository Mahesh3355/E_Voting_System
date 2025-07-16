# Blockchain Voting System Setup Guide

This guide will help you set up the complete blockchain voting system with smart contracts, backend, and frontend integration.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or cloud)
3. **MetaMask** browser extension
4. **Git**

## Step 1: Smart Contract Setup

### 1.1 Install Dependencies

```bash
cd contracts
npm install
```

### 1.2 Configure Environment

Create a `.env` file in the `contracts` directory:

```env
PRIVATE_KEY=your-private-key-here
RPC_URL=http://localhost:8545
# For testnet: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### 1.3 Compile Contracts

```bash
npx hardhat compile
```

### 1.4 Deploy Contracts

```bash
npx hardhat run scripts/deploy.ts --network localhost
# or for testnet: npx hardhat run scripts/deploy.ts --network sepolia
```

### 1.5 Run Tests

```bash
npx hardhat test
```

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/voting_system

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=your-private-key-here
CONTRACT_ADDRESS=deployed-contract-address-here
```

### 2.3 Deploy Contract to Backend

```bash
node deploy-contract.js
```

### 2.4 Start Backend Server

```bash
npm start
# or for development: npm run dev
```

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd final/admin
npm install
```

### 3.2 Configure Environment

Create a `.env.local` file in the `final/admin` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3.3 Start Frontend Development Server

```bash
npm run dev
```

## Step 4: System Integration

### 4.1 Create Election Event

1. Go to the admin panel
2. Create a new election event with dates
3. The system will automatically create the blockchain election

### 4.2 Register Voters

1. Voters register through the frontend
2. Admin approves voters
3. Voters are automatically registered on blockchain

### 4.3 Register Candidates

1. Candidates submit applications
2. Admin reviews and approves candidates
3. Approved candidates are registered on blockchain

### 4.4 Voting Process

1. Voters connect their MetaMask wallet
2. Select an election and candidate
3. Cast vote on blockchain
4. View real-time results

## Step 5: Testing the System

### 5.1 Test Voter Registration

```bash
# Test voter registration API
curl -X POST http://localhost:5000/api/voter/send-otp \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","registrationNumber":"12345","email":"test@example.com","degree":"B.Tech"}'
```

### 5.2 Test Blockchain Integration

```bash
# Test blockchain voter registration
curl -X POST http://localhost:5000/api/blockchain/register-voter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 5.3 Test Voting

```bash
# Test vote casting
curl -X POST http://localhost:5000/api/blockchain/cast-vote \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","candidateId":"candidate_id","electionId":1}'
```

## Configuration Details

### Smart Contract Features

- **Predefined Positions**: 5 hardcoded positions (President, Vice President, etc.)
- **SHA256 Hashing**: All data is hashed for integrity
- **Gas Optimization**: Optimized for cost efficiency
- **Automatic Reset**: Election data resets automatically for new elections

### Backend Features

- **MongoDB Integration**: Stores user data and election events
- **Email OTP**: Secure voter authentication
- **Blockchain Integration**: Full smart contract interaction
- **File Upload**: Candidate profile pictures and documents

### Frontend Features

- **Web3 Integration**: MetaMask wallet connection
- **Real-time Updates**: Live election results
- **Responsive Design**: Works on all devices
- **Admin Panel**: Complete election management

## Security Considerations

1. **Private Keys**: Never expose private keys in production
2. **Environment Variables**: Use secure environment management
3. **HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Implement API rate limiting
5. **Input Validation**: Validate all user inputs

## Production Deployment

### 1. Smart Contract

- Deploy to mainnet or testnet
- Verify contract on Etherscan
- Set appropriate gas limits

### 2. Backend

- Use production MongoDB
- Set up proper email service
- Configure HTTPS
- Set up monitoring

### 3. Frontend

- Build for production: `npm run build`
- Deploy to Vercel/Netlify
- Configure environment variables

## Troubleshooting

### Common Issues

1. **MetaMask Connection Failed**

   - Ensure MetaMask is installed
   - Check network configuration
   - Clear browser cache

2. **Contract Deployment Failed**

   - Check private key format
   - Verify RPC URL
   - Ensure sufficient gas

3. **Backend Connection Issues**

   - Check MongoDB connection
   - Verify environment variables
   - Check port availability

4. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify import paths

## Support

For issues and questions:

1. Check the console logs
2. Review the test files
3. Verify all environment variables
4. Ensure all services are running

## Next Steps

1. **Customize Positions**: Modify predefined positions in the smart contract
2. **Add Features**: Implement additional voting mechanisms
3. **Scale**: Add support for multiple elections
4. **Analytics**: Add voting analytics and reporting
5. **Mobile App**: Develop mobile application
