# Next Steps for AssetBitKYCVerification Deployment and Integration

This document outlines the steps to deploy and utilize the AssetBitKYCVerification contract on the Kernel (KRNL) network.

## 1. Deployment Steps

### Local Testing

1. Compile the contracts:
   ```
   npm run compile
   ```

2. Run the tests to verify contract functionality:
   ```
   npm test
   ```

3. Deploy to a local network for testing:
   ```
   npx hardhat node
   npm run deploy:kyc
   ```

### Testnet Deployment (Sepolia)

1. Create a `.env` file based on the `env.example` template:
   ```
   cp env.example .env
   ```

2. Edit the `.env` file to include your:
   - Sepolia RPC URL
   - Private key (for deployment)
   - Etherscan API key (for verification)

3. Deploy to Sepolia:
   ```
   npm run deploy:kyc:sepolia
   ```

4. Make note of the proxy address from the console output.

### Kernel (KRNL) Deployment

1. Update the Hardhat config to include the Kernel network configuration when available.

2. Deploy to Kernel:
   ```
   npm run deploy:kyc -- --network kernel
   ```

## 2. Post-Deployment Tasks

1. Save the proxy contract address for future reference.

2. Update any required configuration in your frontend or backend systems to reference the deployed contract.

3. Set the proper token authority address:
   ```javascript
   const kycContract = await ethers.getContractAt("AssetBitKYCVerification", proxyAddress);
   await kycContract.setTokenAuthority("0xYourTokenAuthorityAddress");
   ```

## 3. Integration with Frontend

1. Use ethers.js or similar library to interact with the contract:

   ```javascript
   // Example code for frontend integration
   import { ethers } from "ethers";
   import AssetBitKYCVerification from "./artifacts/contracts/AssetBitKYCVerification.sol/AssetBitKYCVerification.json";

   // Connect to the contract
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   const signer = provider.getSigner();
   const contract = new ethers.Contract(
     "YOUR_PROXY_ADDRESS", 
     AssetBitKYCVerification.abi, 
     signer
   );

   // Check KYC status
   const isVerified = await contract.isKYCVerified("0xUserAddress");
   
   // Admin functions (for admin interface)
   async function verifyUser(address) {
     const tx = await contract.verifyUser(address);
     await tx.wait();
     // Handle success
   }
   ```

## 4. Upgrades

If you need to upgrade the contract in the future:

1. Create a new implementation contract (e.g., `AssetBitKYCVerificationV2.sol`).

2. Set the proxy address in your `.env` file:
   ```
   KYC_PROXY_ADDRESS=0xYourProxyAddressHere
   ```

3. Run the upgrade script:
   ```
   npm run upgrade:kyc:sepolia
   ```

## 5. Security Considerations

1. Ensure that proper access controls are in place (only contract owner can verify/revoke users).

2. Consider implementing a multi-signature wallet as the contract owner for increased security.

3. Thoroughly test any contract upgrades on a testnet before deploying to mainnet.

4. Consider auditing the contract before deploying to a production environment.

## 6. Monitoring and Maintenance

1. Set up monitoring for contract events to track KYC verification and revocation.

2. Create a dashboard for administrators to manage KYC verifications.

3. Document the process for contract upgrades and establish a governance process for approving changes.

---

For any questions or issues, please refer to the [AssetBit documentation](https://docs.assetbit.io) or contact the development team. 