# Deploying AssetBitKYCVerification Contract on Remix and Registering on KRNL

This guide will walk you through the process of deploying the AssetBitKYCVerification contract using Remix and registering it on the Kernel (KRNL) website.

## 1. Deploying the Contract on Remix

### Step 1: Open Remix IDE
- Go to [Remix IDE](https://remix.ethereum.org/)

### Step 2: Create a New File
- Click on the "File explorer" icon on the left sidebar
- Click the "Create New File" button (+ icon)
- Name it `AssetBitKYCVerification.sol`
- Copy the entire code from `RemixReadyContract.sol` and paste it into this new file

### Step 3: Configure Remix for OpenZeppelin Imports
- In Remix, go to the "Plugin Manager" tab (icon looks like a plug)
- Find and activate the "Remix Plugin for OpenZeppelin" if it isn't already activated
- This will allow you to use OpenZeppelin contracts without manually importing them

### Step 4: Compile the Contract
- Go to the "Solidity Compiler" tab on the left sidebar
- Set the compiler version to at least 0.8.20 (matching your contract's pragma)
- Click "Compile AssetBitKYCVerification.sol"
- Make sure there are no compilation errors

### Step 5: Deploy the UUPS Proxy
1. Go to the "Deploy & Run Transactions" tab
2. Select "Injected Provider - MetaMask" from the Environment dropdown (ensure your MetaMask is connected to the Kernel network)
3. Since this is a UUPS upgradeable contract, you'll need to deploy it through a proxy:
   - Click the dropdown next to the "Deploy" button
   - Select "Deploy with Proxy"
   - This will open the initialization parameters form
   - For `initialOwner`: Enter your wallet address (this will be the admin)
   - For `_tokenAuthority`: Enter the token authority contract address for KRNL, or use a placeholder address like `0x0000000000000000000000000000000000000001` that you can update later
   - Click "Transact" and confirm the transaction in MetaMask

### Step 6: Verify the Deployment
- After deployment, you'll see your contract under "Deployed Contracts"
- Expand it to see and interact with all the functions
- Test the basic functionality:
  - Try calling `isKYCVerified` with your address (should return false initially)
  - Call `verifyUser` with an address you want to verify
  - Call `isKYCVerified` again to confirm it now returns true

## 2. Registering the dApp on KRNL Website

### Step 1: Gather Deployment Information
- Copy the proxy contract address from Remix after deployment (this is the address users will interact with)
- Prepare a brief description of your dApp
- Prepare metadata including:
  - dApp name (AssetBit KYC Verification)
  - Logo/icon
  - Category (Financial/Identity)
  - Website URL
  - GitHub repository (if applicable)

### Step 2: Access KRNL Developer Portal
- Go to the [KRNL Developer Platform](https://kernel.community/en/build) (or the specific developer portal URL)
- Connect your wallet (use the same wallet you used to deploy the contract)

### Step 3: Register Your dApp
- Look for an option like "Register New dApp" or "Submit Project"
- Fill in the required information:
  - dApp Name: AssetBit KYC Verification
  - Contract Address: [Your deployed proxy contract address]
  - Description: A KYC verification system for AssetBit platform that handles user verification status
  - Category: Select appropriate category (Finance/Identity)
  - Upload your logo
  - Add any other required metadata

### Step 4: Submit for Review
- Review all information
- Submit your application
- The KRNL team will review your submission and may contact you for additional information

## 3. Post-Registration Steps

### Update TokenAuthority (if needed)
If you used a placeholder address for the TokenAuthority, you should update it after registration:

1. In Remix, under your deployed contract:
   - Find the `setTokenAuthority` function
   - Enter the correct TokenAuthority address from KRNL
   - Click "transact" and confirm the transaction

### Monitor Your Contract
- Set up monitoring for your contract events
- Consider creating an admin interface for managing KYC verifications

## Notes on Upgradeability

Since this is an upgradeable contract using the UUPS pattern, you can upgrade it in the future:

1. Create a new implementation contract with enhanced functionality
2. Use the upgradeable proxy features to point to the new implementation
3. In Remix, this can be done through the OpenZeppelin plugin by selecting "Upgrade" option for your deployed proxy

## Alternative: Using the Simple Non-Upgradeable Contract

If you prefer a simpler deployment without the complexity of upgradeable contracts, you can use the `RemixSimpleContract.sol` file instead.

### For Simple Deployment:

1. Create a new file in Remix called `AssetBitKYCVerificationSimple.sol`
2. Copy the content from `RemixSimpleContract.sol` into this file
3. Compile it using the Solidity Compiler tab
4. Deploy directly (no proxy needed):
   - Go to the "Deploy & Run Transactions" tab
   - Select "Injected Provider - MetaMask"
   - In the constructor parameters, enter the token authority address (or a placeholder)
   - Click "Deploy" and confirm the transaction

This version provides the same functionality but without the ability to upgrade the contract in the future. It's easier to deploy and interact with, but if you need to make changes later, you would need to deploy a new contract and migrate all data.

## Security Considerations

1. Always thoroughly test your contract's functionality after deployment
2. Consider getting an audit before handling real user data
3. Implement proper access controls and consider using a multi-sig wallet for admin operations
4. Keep private keys secure 