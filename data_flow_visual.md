# Blockchain Voting System - Visual Data Flow Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BLOCKCHAIN VOTING SYSTEM                              │
│                              Data Flow Architecture                             │
└─────────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   FRONTEND      │
                    │   (Next.js)     │
                    │                 │
                    │ • React UI      │
                    │ • Web3 Wallet   │
                    │ • Admin Panel   │
                    └─────────┬───────┘
                              │
                              │ HTTP/WebSocket
                              │
                    ┌─────────▼───────┐
                    │    BACKEND      │
                    │   (Node.js)     │
                    │                 │
                    │ • Express API   │
                    │ • MongoDB       │
                    │ • Email OTP     │
                    └─────────┬───────┘
                              │
                              │ Web3/ethers.js
                              │
                    ┌─────────▼───────┐
                    │   BLOCKCHAIN    │
                    │  (Ethereum)     │
                    │                 │
                    │ • Smart Contract│
                    │ • Voting Logic  │
                    │ • Results       │
                    └─────────────────┘
```

## User Registration Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Voter     │───►│  Frontend   │───►│   Backend   │───►│  Blockchain │
│  (User)     │    │  (Register) │    │  (API)      │    │  (Contract) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Enter Details  │ 2. Form Submit    │ 3. Validate Input │ 4. Register Voter
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Email     │    │   Form      │    │   Email     │    │   Voter     │
│   OTP       │    │ Validation  │    │   Service   │    │ Registration│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 5. Send OTP       │ 6. Success Msg    │ 7. Store in DB    │ 8. Emit Event
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Verify    │    │   Success   │    │   MongoDB   │    │   Event     │
│   OTP       │    │   Message   │    │   Storage   │    │   Emitted   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Voting Process Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Voter     │───►│  Frontend   │───►│   Backend   │───►│  Blockchain │
│  (Wallet)   │    │  (Vote UI)  │    │  (API)      │    │  (Contract) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Connect Wallet │ 2. Select Vote    │ 3. Validate Voter │ 4. Execute Vote
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   MetaMask  │    │   Vote      │    │   Check     │    │   Update    │
│   Connect   │    │   Selection │    │   Eligibility│   │   Results   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 5. Sign Tx        │ 6. Confirm Vote   │ 7. Update DB      │ 8. Emit Event
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Sign      │    │   Success   │    │   Sync      │    │   VoteCast  │
│   Transaction│   │   Message   │    │   Database  │    │   Event     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Results and Analytics Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin     │───►│  Frontend   │───►│   Backend   │───►│  Blockchain │
│  (Dashboard)│    │  (Results)  │    │  (API)      │    │  (Contract) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. View Results   │ 2. Request Data   │ 3. Fetch Results  │ 4. Read Contract
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Analytics │    │   Display   │    │   Process   │    │   Return    │
│   Dashboard │    │   Results   │    │   Data      │    │   Data      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 5. Generate Charts│ 6. Real-time UI   │ 7. Format Data    │ 8. Vote Counts
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Export    │    │   Update    │    │   Cache     │    │   Positions │
│   Reports   │    │   Display   │    │   Results   │    │   Results   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   HomePage  │  │   Admin     │  │   Voting    │              │
│  │             │  │   Panel     │  │   Interface │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Web3Context │  │ Blockchain  │  │ ChoiceCard  │              │
│  │             │  │ Voting      │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    API Service Layer                        │ │
│  │              (blockchain.ts, REST calls)                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Express   │  │   MongoDB   │  │   Email     │              │
│  │   Server    │  │   Database  │  │   Service   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   API       │  │   Models    │  │   Nodemailer│              │
│  │   Routes    │  │   (Mongoose)│  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Blockchain  │  │   File      │  │   Auto      │              │
│  │   Service   │  │   Upload    │  │   Archive   │              │
│  │  (ethers.js)│  │  (Multer)   │  │  (Scheduler)│              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     BLOCKCHAIN LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    VotingSystem.sol                         │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │   Voter     │  │  Candidate  │  │  Election   │         │ │
│  │  │  Registry   │  │  Registry   │  │  Registry   │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  │         │                │                │                 │ │
│  │         ▼                ▼                ▼                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │   Voting    │  │   Results   │  │   Admin     │         │ │
│  │  │   Logic     │  │   Storage   │  │   Controls  │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  │         │                │                │                 │ │
│  │         ▼                ▼                ▼                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │   Events    │  │   Security  │  │   Emergency │         │ │
│  │  │   System    │  │   Guards    │  │   Controls  │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Storage Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONGODB DATABASE                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Voters    │  │ Candidates  │  │ Elections   │              │
│  │             │  │             │  │             │              │
│  │ • email     │  │ • fullName  │  │ • name      │              │
│  │ • wallet    │  │ • position  │  │ • startTime │              │
│  │ • otp       │  │ • photo     │  │ • endTime   │              │
│  │ • verified  │  │ • active    │  │ • active    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Events    │  │   Results   │  │   Archives  │              │
│  │             │  │             │  │             │              │
│  │ • type      │  │ • electionId│  │ • data      │              │
│  │ • data      │  │ • results   │  │ • timestamp │              │
│  │ • timestamp │  │ • metadata  │  │ • hash      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ETHEREUM BLOCKCHAIN                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Voters    │  │ Candidates  │  │ Elections   │              │
│  │   Mapping   │  │   Mapping   │  │   Mapping   │              │
│  │             │  │             │  │             │              │
│  │ address =>  │  │ id =>       │  │ id =>       │              │
│  │ Voter struct│  │ Candidate   │  │ Election    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Vote Status │  │   Results   │  │   Events    │              │
│  │   Mapping   │  │   Storage   │  │   Logs      │              │
│  │             │  │             │  │             │              │
│  │ electionId  │  │ Real-time   │  │ VoteCast    │              │
│  │ position    │  │ vote counts │  │ Registration│              │
│  │ address     │  │             │  │ Results     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Auto-Archiving Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Scheduler │───►│   Backend   │───►│  Blockchain │───►│   MongoDB   │
│   Script    │    │   API       │    │  Contract   │    │   Archive   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Check Elections│ 2. Fetch Results  │ 3. Complete      │ 4. Store Results
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Cron Job  │    │   Process   │    │   Update    │    │   Index     │
│   (Daily)   │    │   Data      │    │   Status    │    │   Data      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 5. Trigger        │ 6. Validate       │ 7. Emit Events   │ 8. Archive
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Process   │    │   Format    │    │   Log       │    │   Backup    │
│   Results   │    │   Results   │    │   Changes   │    │   Data      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Security Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Input     │───►│  Frontend   │───►│   Backend   │───►│  Blockchain │
│ Validation  │    │ Validation  │    │ Validation  │    │ Validation  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Form Checks    │ 2. Client Side    │ 3. Server Side   │ 4. Smart Contract
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Email     │    │   Wallet    │    │   Rate      │    │   Access    │
│   OTP       │    │   Connect   │    │   Limiting  │    │   Control   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 5. Verify OTP     │ 6. Sign Tx        │ 7. Helmet        │ 8. Ownable
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Success   │    │   Success   │    │   Success   │    │   Success   │
│   Login     │    │   Connect   │    │   Request   │    │   Execute   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Key Data Flow Points

### 🔐 **Authentication & Security**

- Email OTP verification for voter registration
- MetaMask wallet connection for voting
- Rate limiting and input validation
- Smart contract access controls

### 🗳️ **Voting Process**

- Real-time blockchain transactions
- Database synchronization
- Event emission and listening
- Vote status tracking

### 📊 **Results Management**

- On-chain vote counting
- Off-chain analytics and caching
- Auto-archiving system
- Real-time result updates

### 🔄 **Data Consistency**

- BigInt serialization for MongoDB
- Blockchain-MongoDB synchronization
- Event-driven updates
- Backup and recovery systems

### 🚀 **Performance Optimizations**

- Caching strategies
- Batch voting operations
- Gas optimization
- Efficient data structures

This architecture ensures a secure, transparent, and verifiable voting system with comprehensive audit trails and real-time updates.
