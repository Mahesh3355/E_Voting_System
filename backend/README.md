# Backend Setup Guide

This guide will help you set up the backend for the blockchain voting system.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment:**

   ```bash
   npm run setup
   ```

3. **Validate configuration:**

   ```bash
   npm run validate
   ```

4. **Start the server:**

   ```bash
   npm start
   ```

5. **(Optional but recommended) Start the auto-complete-and-archive scheduler:**
   This script will automatically complete and archive elections after voting ends.
   ```bash
   node auto-complete-and-archive.js
   ```
   - The script checks for ended elections, completes them on-chain, and archives results to MongoDB.
   - It skips elections already archived and retries archiving if it fails.

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/votechain

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=your-private-key-here
CONTRACT_ADDRESS=deployed-contract-address-here

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### MongoDB Collections

- `archivedElectionResults`: Stores archived election results (BigInt values are stored as strings).
- `electionevents`: Stores active/ongoing election events.
- `candidates`, `voters`: Store candidate and voter data.

### Setting Up Gmail for OTP

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### Setting Up Private Key

#### For Development (Local Hardhat Network)

```bash
# Generate a test private key
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

#### For Production

- Use MetaMask: Account → Three dots → Account details → Export private key
- Or use a hardware wallet for better security

### Setting Up Contract Address

1. Deploy the smart contract first (see contracts/README.md)
2. Copy the deployed contract address
3. Update `CONTRACT_ADDRESS` in your `.env` file

## Troubleshooting

### Common Errors

#### 1. "invalid private key" Error

**Problem:** The private key in your `.env` file is invalid or missing.

**Solution:**

```bash
# Generate a valid private key
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"

# Update your .env file with the generated key
```

#### 2. "Admin wallet not configured" Error

**Problem:** The `PRIVATE_KEY` environment variable is not set.

**Solution:**

1. Check if `.env` file exists
2. Ensure `PRIVATE_KEY` is set correctly
3. Run validation: `npm run validate`

#### 3. "Smart contract not initialized" Error

**Problem:** The contract address is not set or invalid.

**Solution:**

1. Deploy the smart contract first
2. Update `CONTRACT_ADDRESS` in `.env`
3. Restart the backend server

#### 4. Email OTP Not Working

**Problem:** Gmail configuration is incorrect.

**Solution:**

1. Use Gmail app password, not regular password
2. Enable 2-factor authentication
3. Check if the email is correct

#### 5. "Do not know how to serialize a BigInt" Error

**Problem:** Blockchain results may contain BigInt values, which MongoDB cannot store directly.

**Solution:**

- The backend now automatically converts all BigInt values to strings before saving to MongoDB.
- If you see this error, make sure you are running the latest backend code.

### Validation Commands

```bash
# Check environment configuration
npm run validate

# Set up environment from scratch
npm run setup:full

# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"
```

## API Endpoints

### Authentication

- `POST /api/voter/send-otp` - Send OTP for voter registration
- `POST /api/voter/verify-otp` - Verify OTP and register voter
- `POST /api/voter/login-send-otp` - Send OTP for login
- `POST /api/voter/login-verify-otp` - Verify OTP for login

### Blockchain Operations

- `POST /api/blockchain/create-election` - Create election on blockchain
- `POST /api/blockchain/register-voter` - Register voter on blockchain
- `POST /api/blockchain/register-candidate` - Register candidate on blockchain
- `POST /api/blockchain/cast-vote` - Cast vote on blockchain
- `GET /api/blockchain/election-results/:id` - Get election results
- `GET /api/blockchain/vote-status?electionId=...&voterAddress=...&position=...` - Check if a voter has already voted for a position (returns `{ hasVoted: true/false }`)

### Candidate Management

- `POST /api/candidate/register` - Register candidate
- `GET /api/candidate/pending` - Get pending candidates
- `POST /api/candidate/:id/status` - Update candidate status
- `GET /api/candidate/approved` - Get approved candidates

### Election Events

- `GET /api/events/current` - Get current election event
- `POST /api/events/create` - Create new election event
- `DELETE /api/events/current` - Delete current event

### Archiving & Results

- `POST /api/elections/archive/:electionId` - Archive election results
- `GET /api/blockchain/latest-archived-result` - Get the latest archived election result

## Development

### Running in Development Mode

```bash
npm run dev
```

### File Structure

```
backend/
├── index.js              # Main server file
├── blockchain.js         # Blockchain service
├── setup-env.js          # Environment setup script
├── validate-env.js       # Environment validation script
├── auto-complete-and-archive.js # Scheduler for auto-completion/archiving
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create this)
├── uploads/              # File uploads directory
│   └── candidates/       # Candidate profile pictures
└── README.md             # This file
```

### Logs and Debugging

The server provides detailed logging:

- ✅ Success messages
- ⚠️ Warning messages
- ❌ Error messages (with full error details for debugging)

## Security Notes

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive data
3. **Use Gmail app passwords** instead of regular passwords
4. **Validate all inputs** before processing
5. **Use HTTPS** in production
6. **Implement rate limiting** for production use

## Production Deployment

1. Set up a production MongoDB instance
2. Use a production blockchain network (mainnet/testnet)
3. Configure proper environment variables
4. Set up HTTPS
5. Implement proper logging and monitoring
6. Set up backup and recovery procedures
