# AssetBitRegistry Smart Contract

## Overview

`AssetBitRegistry` is a Solidity smart contract for registering, viewing, and transferring digital assets on-chain. Each asset has a name, description, and owner. The contract emits events for registration and transfer.

## Features
- Register new assets
- Transfer asset ownership
- View asset details
- Emits `AssetRegistered` and `AssetTransferred` events

## Setup

1. **Clone the repo and install dependencies:**
   ```bash
   cd contracts
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values:
     ```
     SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
     PRIVATE_KEY=your_private_key_here
     ETHERSCAN_API_KEY=your_etherscan_api_key_here
     ```

## Compile

```bash
npx hardhat compile
```

## Deploy

```bash
npx hardhat run scripts/deployAssetBitRegistry.ts --network sepolia
```

## Verify

```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

## Test (optional)

```bash
npx hardhat test
```

## Contract Functions
- `registerAsset(string name, string description)`
- `transferAsset(uint256 assetId, address newOwner)`
- `getAsset(uint256 assetId) returns (string, string, address)`

## Events
- `AssetRegistered(uint256 assetId, string name, address owner)`
- `AssetTransferred(uint256 assetId, address from, address to)`

## AssetBitKYCVerification Contract

The `AssetBitKYCVerification` contract is designed to handle KYC verification for the AssetBit platform on the Kernel (KRNL) network. It is implemented using the UUPS upgrade pattern to allow for future enhancements.

### Features

- Stores KYC verification status for user addresses
- Admin-controlled verification and revocation
- Batch verification for gas efficiency
- Integration with TokenAuthority contracts
- Pausable functionality for emergency situations
- Upgradeable implementation using OpenZeppelin's UUPS pattern
- Event emission for all important state changes

### Deployment

To deploy the AssetBitKYCVerification contract:

```bash
npx hardhat run scripts/deploy-kyc-verification.ts --network <network-name>
```

### Interacting with the Contract

#### Verifying Users

Only the contract owner can verify users:

```javascript
// Verify a single user
await kycContract.verifyUser(userAddress);

// Verify multiple users in a batch
await kycContract.verifyBatch([user1, user2, user3]);
```

#### Checking Verification Status

```javascript
// Returns true if user is verified, false otherwise
const isVerified = await kycContract.isKYCVerified(userAddress);
```

#### Revoking Verification

```javascript
await kycContract.revokeVerification(userAddress);
```

#### Setting Token Authority

```javascript
await kycContract.setTokenAuthority(newTokenAuthorityAddress);
```

#### Pausing/Unpausing the Contract

```javascript
// Pause the contract
await kycContract.pause();

// Unpause the contract
await kycContract.unpause();
```

### Testing

Run tests for the KYC contract:

```bash
npx hardhat test test/AssetBitKYCVerification.test.ts
```

### Upgrading

To upgrade the contract in the future:

```javascript
const AssetBitKYCVerificationV2 = await ethers.getContractFactory("AssetBitKYCVerificationV2");
const upgraded = await upgrades.upgradeProxy(existingProxyAddress, AssetBitKYCVerificationV2);
```

---

**Next steps:**
- Integrate with the frontend using ethers.js or wagmi
- Add UI for asset registration, transfer, and explorer 