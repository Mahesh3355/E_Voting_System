# Frontend (Admin Panel & Voting UI) - Setup Guide

This is the Next.js/React frontend for the Blockchain Voting System.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the `final/admin` directory:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

- This ensures all API calls go to the backend server (port 5000).

### 3. Run the development server

```bash
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm start
```

## Wallet Integration

- The app supports MetaMask and other Web3 wallets for secure voting.
- Make sure MetaMask is installed and connected to the correct network (e.g., local Hardhat or testnet).

## API Connection Troubleshooting

- If you see errors like `:3000/api/... 404 Not Found`, your frontend is trying to call the backend on the wrong port.
- Always use `NEXT_PUBLIC_API_URL` in your `.env.local` and in all API calls (see `src/services/blockchain.ts`).
- Restart the frontend dev server after changing `.env.local`.

## Project Structure

```
final/admin/
├── src/
│   ├── app/           # Next.js app directory
│   │   ├── admin/     # Admin panel pages
│   │   ├── elections/ # Voting pages for each position
│   │   ├── votenow/   # Main voting UI
│   │   └── ...
│   ├── components/    # Shared React components
│   ├── contexts/      # Web3 context provider
│   └── services/      # blockchain.ts (API and blockchain service)
├── public/            # Static assets
├── package.json
└── README.md
```

## Common Issues

- **API not connecting:** Check `NEXT_PUBLIC_API_URL` and backend server status.
- **Wallet not detected:** Ensure MetaMask is installed and browser supports Web3.
- **CORS errors:** Backend must allow requests from frontend origin.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [MetaMask Docs](https://docs.metamask.io/)
