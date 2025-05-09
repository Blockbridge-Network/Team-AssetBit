# Team-AssetBit

# AssetBit - Blockchain-Based Commodity Trading Platform

![AssetBit Logo](public/images/assetbit-logo.png)

## Overview

AssetBit is a modern web3 platform designed for tokenizing and trading real-world commodities on the blockchain. The platform enables fractional ownership of physical assets through tokenization, providing users with a secure, transparent, and efficient way to invest in commodities like gold, silver, copper, agricultural products, and more.

## Project Structure
- `contracts/`: Smart contracts (written in Solidity via Remix)
- `frontend/`: DApp code (React, Next.js, or React Native)
- `backend/`: Nodejs + Express
- `assets/`: Screenshots, mockups, etc.
- `videos/`: Demo screen recordings
- `deployment/`: Script files and deployed addresses

## Tech Stack
- Solidity + Hardhat (or Remix)
- React / Next.js / React Native
- IPFS / Filecoin (optional)
- MetaMask / WalletConnect
- Ethers.js / Wagmi / RainbowKit

## Features

### Core Functionality

- **Asset Tokenization**: Convert physical commodities into digital tokens on the blockchain
- **Fractional Ownership**: Own portions of high-value assets that would otherwise be inaccessible
- **Secure Trading**: Buy, sell, and trade commodity tokens with blockchain security
- **Real-time Market Data**: Access current and historical pricing for all supported commodities
- **Portfolio Management**: Track and manage your commodity investments in one place
- **Blockchain Integration**: Connect your MetaMask or other Web3 wallets

### Key Features

- **User Authentication**: Email/password and Web3 wallet authentication options
- **KYC Verification**: Complete identity verification for regulatory compliance
- **Interactive Dashboard**: View portfolio performance, asset allocation, and market trends
- **Trading Interface**: Easy-to-use interface for buying and selling commodity tokens
- **Market Analysis**: Technical indicators and charting tools for market analysis
- **Transaction History**: Complete record of all your trading activities
- **Multi-chain Support**: Operate across different blockchain networks

## Architecture

AssetBit is built using a modern tech stack:

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks and context
- **Data Visualization**: Recharts and TradingView integration
- **Web3 Integration**: ethers.js for blockchain interactions

### Backend
-**FRAMEWORK**: NodeJs
- **API Routes**: Next.js API routes with route handlers
- **Database**: Prisma ORM with SQL database
- **Authentication**: NextAuth.js with multiple providers
- **File Storage**: Local for development, cloud storage for production

### Blockchain
- **Smart Contracts**: Solidity contracts for token management
- **Blockchain**: Ethereum-compatible chains (mainnet, testnet)
- **Standards**: ERC-20 tokens for commodities
- **Oracle Integration**: KRNL for off-chain data verification

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MetaMask or other Web3 wallet
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/assetbit.git
   cd assetbit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Authentication
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # External APIs
   COMMODITY_API_KEY="your-commodity-api-key"
   
   # Blockchain
   NEXT_PUBLIC_INFURA_PROJECT_ID="your-infura-project-id"
   NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-api-key"
   ```

4. **Set up the database**:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the server**:
   ```bash
   cd backend
   node Index.js
   ```
6. **Start the front-end**
    ```
    cd ..
    npm run dev
    ```

7. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## User Guide

### Registration and KYC

1. **Sign Up**: Create an account using email/password or connect your Web3 wallet
2. **Verify Email**: Confirm your email address through the verification link
3. **Complete KYC**: Submit required identity information and documents
4. **Wait for Verification**: KYC verification is processed (usually within 24-48 hours)

### Connecting Your Wallet

1. Navigate to the dashboard
2. Click "Connect Wallet" in the top-right corner
3. Select your wallet provider (MetaMask, etc.)
4. Approve the connection request in your wallet

### Trading Commodities

#### Buying Commodities
1. Navigate to the "Market" or "Trade" page
2. Select the commodity you wish to purchase
3. Enter the amount you want to buy
4. Review the transaction details
5. Confirm the purchase

#### Selling Commodities
1. Navigate to the "Dashboard" or "Portfolio" page
2. Select the commodity you wish to sell
3. Enter the amount to sell and recipient address
4. Review the transaction details
5. Confirm the sale

### Dashboard Navigation

- **Overview**: Portfolio summary, asset allocation, and performance metrics
- **Market**: Real-time market data for all supported commodities
- **Portfolio**: Detailed view of your holdings with price performance
- **Trade**: Interface for buying and selling commodity tokens
- **Profile**: User information and settings
- **KYC**: Verification status and submission form

## Technical Documentation

### Project Structure

```
assetbit/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets and images
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard page and components
│   │   ├── market/         # Market page and components
│   │   ├── kyc/            # KYC verification
│   │   └── ...             # Other pages
│   ├── components/         # Reusable React components
│   ├── contracts/          # Smart contract ABIs and config
│   ├── data/               # Static data and commodities info
│   ├── lib/                # Utility functions and helpers
│   └── styles/             # Global styles
├── .env                    # Environment variables
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

### Component Architecture

AssetBit follows a component-based architecture:

- **UI Components**: Basic UI elements like buttons, cards, and inputs
- **Feature Components**: Specialized components for specific features
- **Layout Components**: Page layouts and navigation elements
- **Container Components**: Components that manage state and data fetching

### Data Flow

1. **User Interactions**: User interacts with the UI
2. **API Requests**: The application makes API calls to fetch or update data
3. **State Updates**: The application state is updated based on API responses
4. **UI Updates**: The UI re-renders to reflect the updated state
5. **Blockchain Transactions**: For trading operations, transactions are submitted to the blockchain
6. **Transaction Confirmation**: The UI updates once the transaction is confirmed

## API Reference

### User APIs

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/signin`: Authenticate a user
- `GET /api/user/profile`: Get the current user's profile
- `PUT /api/user/profile`: Update the user's profile

### KYC APIs

- `GET /api/kyc/status`: Check KYC verification status
- `POST /api/kyc/submit`: Submit KYC information
- `PUT /api/kyc/update`: Update existing KYC information

### Market APIs

- `GET /api/commodity-prices`: Get real-time commodity prices
- `GET /api/commodity-prices?commodity=GOLD&interval=1d`: Get specific commodity price with interval

### Trading APIs

- `POST /api/marketplace/buy`: Execute a buy transaction
- `POST /api/marketplace/sell`: Execute a sell transaction

## Smart Contracts

AssetBit uses several smart contracts for its operations:

### AssetBitRegistry Contract

The core contract for managing tokenized assets:

- **Purpose**: Tracks ownership and manages transfers of tokenized assets
- **Functions**:
  - `registerAsset()`: Register a new asset on the blockchain
  - `transferAsset()`: Transfer ownership of an asset
  - `getAsset()`: Retrieve asset information

### Commodity Token Contracts

ERC-20 compliant tokens representing each commodity:

- **Purpose**: Represent ownership shares of physical commodities
- **Features**:
  - Standard ERC-20 functionality (transfer, balanceOf, etc.)
  - Minting and burning capabilities for supply management
  - Pausable functionality for emergency situations

### KRNL Integration for KYC

- **Purpose**: Handle decentralized KYC verification
- **Implementation**: Oracle-based verification system using KRNL network
- **Functions**:
  - `submitKYC()`: Submit KYC data for verification
  - `verifyKYC()`: Callback function for KRNL verification results
  - `getKYCStatus()`: Check verification status

## Deployment

### Development Environment

- Local development server with Next.js
- SQLite database for development
- Hardhat for local blockchain

### Testing Environment

- Staging deployment on Vercel/Netlify
- Test database instance
- Testnet blockchain networks (Sepolia, etc.)

### Production Environment

- Production deployment on Vercel/AWS
- Production database (PostgreSQL)
- Mainnet blockchain networks

## Security Measures

AssetBit implements multiple security measures:

- **Authentication**: Secure user authentication with NextAuth.js
- **Data Encryption**: Sensitive user data is encrypted
- **Input Validation**: All user inputs are validated and sanitized
- **Smart Contract Audits**: Contracts undergo security audits
- **Rate Limiting**: API rate limiting to prevent abuse
- **HTTPS**: Secure communication with TLS/SSL

## Contributing

We welcome contributions to AssetBit! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure everything works
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact and Support

- **Website**: [assetbit.com](https://assetbit.com)
- **Email**: support@assetbit.com
- **Twitter**: [@AssetBit](https://twitter.com/AssetBit)
- **Discord**: [Join our community](https://discord.gg/assetbit)

---

## Project Structure
- `contracts/`: Smart contracts (written in Solidity via Remix)
- `frontend/`: DApp code (React, Next.js, or React Native)
- `backend/`: Nodejs + Express
- `assets/`: Screenshots, mockups, etc.
- `videos/`: Demo screen recordings
- `deployment/`: Script files and deployed addresses

## Tech Stack
- Solidity + Hardhat (or Remix)
- React / Next.js / React Native
- IPFS / Filecoin (optional)
- MetaMask / WalletConnect
- Ethers.js / Wagmi / RainbowKit

## How to Run Locally
1. Clone the repo  
2.  `cd backend`
3.  `node .\index.js`
4. `cd frontend && npm install`
5. `npm run dev` 

## Contracts
| Contract | Address | Network |
|----------|---------|---------|
| ExampleLoan.sol | 0x... | Sonic Testnet |

## 📸 Screenshots
![Screenshot 1](./images/screenshot-1.png)

## 🎥 Demo Video
[Watch here](./videos/demo.mp4)

## Authors
- Samuel Okyere Nyarko (Frontend)
- Samuel Okyere Nyarko (Backend)
- Samuel Okyere Nyarko (Solidity)

## 📄 License
MIT or GPL-3.0
