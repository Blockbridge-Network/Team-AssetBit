# AssetBit KYC Verification for Remix and KRNL

This document provides links to the Solidity contract files and deployment guide for deploying AssetBit's KYC verification smart contract using Remix IDE and registering it on the KRNL platform.

## Contract Files

### Main Upgradeable Contract
The main upgradeable contract uses OpenZeppelin's UUPS pattern to allow future upgrades:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title AssetBitKYCVerification
 * @dev Handles KYC verification for AssetBit on Kernel (KRNL) network
 * Implements upgradeable pattern for future enhancements
 */
contract AssetBitKYCVerification is 
    Initializable, 
    OwnableUpgradeable, 
    UUPSUpgradeable,
    PausableUpgradeable
{
    // Mapping to store KYC verification status by user address
    mapping(address => bool) private _kycVerified;
    
    // TokenAuthority contract address (if applicable)
    address public tokenAuthority;

    // Events
    event KYCVerified(address indexed user, address indexed verifier);
    event KYCRevoked(address indexed user, address indexed revoker);
    event TokenAuthorityUpdated(address indexed oldAuthority, address indexed newAuthority);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev Initializes the contract replacing the constructor for upgradeable contracts
     * @param initialOwner The address that will own the contract
     * @param _tokenAuthority The address of the TokenAuthority contract
     */
    function initialize(
        address initialOwner,
        address _tokenAuthority
    ) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __Pausable_init();
        
        tokenAuthority = _tokenAuthority;
    }
    
    /**
     * @dev Sets the user's KYC verification status to true
     * @param user Address of the user to verify
     */
    function verifyUser(address user) external onlyOwner whenNotPaused {
        require(user != address(0), "Invalid user address");
        require(!_kycVerified[user], "User already KYC verified");
        
        _kycVerified[user] = true;
        emit KYCVerified(user, _msgSender());
    }
    
    /**
     * @dev Sets the user's KYC verification status to false
     * @param user Address of the user to revoke verification from
     */
    function revokeVerification(address user) external onlyOwner whenNotPaused {
        require(user != address(0), "Invalid user address");
        require(_kycVerified[user], "User not KYC verified");
        
        _kycVerified[user] = false;
        emit KYCRevoked(user, _msgSender());
    }
    
    /**
     * @dev Verifies multiple users at once (gas optimization for batch operations)
     * @param users Array of user addresses to verify
     */
    function verifyBatch(address[] calldata users) external onlyOwner whenNotPaused {
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            if (user != address(0) && !_kycVerified[user]) {
                _kycVerified[user] = true;
                emit KYCVerified(user, _msgSender());
            }
        }
    }
    
    /**
     * @dev Updates the TokenAuthority contract address
     * @param newTokenAuthority The address of the new TokenAuthority contract
     */
    function setTokenAuthority(address newTokenAuthority) external onlyOwner {
        require(newTokenAuthority != address(0), "Invalid authority address");
        address oldAuthority = tokenAuthority;
        tokenAuthority = newTokenAuthority;
        emit TokenAuthorityUpdated(oldAuthority, newTokenAuthority);
    }
    
    /**
     * @dev Checks if a user is KYC verified
     * @param user Address of the user to check
     * @return True if the user is KYC verified, false otherwise
     */
    function isKYCVerified(address user) external view returns (bool) {
        return _kycVerified[user];
    }
    
    /**
     * @dev Pauses the contract, preventing KYC operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses the contract, allowing KYC operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Function that should revert when msg.sender is not authorized to upgrade the contract
     * @param newImplementation The address of the new implementation contract
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
```

### Simplified Contract (Non-Upgradeable)
A simplified version without the upgradeability pattern:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AssetBitKYCVerificationSimple
 * @dev Handles KYC verification for AssetBit on Kernel (KRNL) network
 * This is a simplified non-upgradeable version for easier deployment
 */
contract AssetBitKYCVerificationSimple is Ownable, Pausable {
    // Mapping to store KYC verification status by user address
    mapping(address => bool) private _kycVerified;
    
    // TokenAuthority contract address (if applicable)
    address public tokenAuthority;

    // Events
    event KYCVerified(address indexed user, address indexed verifier);
    event KYCRevoked(address indexed user, address indexed revoker);
    event TokenAuthorityUpdated(address indexed oldAuthority, address indexed newAuthority);
    
    /**
     * @dev Constructor sets the owner and initial token authority
     * @param _tokenAuthority The address of the TokenAuthority contract
     */
    constructor(address _tokenAuthority) Ownable(msg.sender) {
        tokenAuthority = _tokenAuthority;
    }
    
    /**
     * @dev Sets the user's KYC verification status to true
     * @param user Address of the user to verify
     */
    function verifyUser(address user) external onlyOwner whenNotPaused {
        require(user != address(0), "Invalid user address");
        require(!_kycVerified[user], "User already KYC verified");
        
        _kycVerified[user] = true;
        emit KYCVerified(user, _msgSender());
    }
    
    /**
     * @dev Sets the user's KYC verification status to false
     * @param user Address of the user to revoke verification from
     */
    function revokeVerification(address user) external onlyOwner whenNotPaused {
        require(user != address(0), "Invalid user address");
        require(_kycVerified[user], "User not KYC verified");
        
        _kycVerified[user] = false;
        emit KYCRevoked(user, _msgSender());
    }
    
    /**
     * @dev Verifies multiple users at once (gas optimization for batch operations)
     * @param users Array of user addresses to verify
     */
    function verifyBatch(address[] calldata users) external onlyOwner whenNotPaused {
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            if (user != address(0) && !_kycVerified[user]) {
                _kycVerified[user] = true;
                emit KYCVerified(user, _msgSender());
            }
        }
    }
    
    /**
     * @dev Updates the TokenAuthority contract address
     * @param newTokenAuthority The address of the new TokenAuthority contract
     */
    function setTokenAuthority(address newTokenAuthority) external onlyOwner {
        require(newTokenAuthority != address(0), "Invalid authority address");
        address oldAuthority = tokenAuthority;
        tokenAuthority = newTokenAuthority;
        emit TokenAuthorityUpdated(oldAuthority, newTokenAuthority);
    }
    
    /**
     * @dev Checks if a user is KYC verified
     * @param user Address of the user to check
     * @return True if the user is KYC verified, false otherwise
     */
    function isKYCVerified(address user) external view returns (bool) {
        return _kycVerified[user];
    }
    
    /**
     * @dev Pauses the contract, preventing KYC operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses the contract, allowing KYC operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
```

## Deployment Guide

### Deploying on Remix

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create a new file in the file explorer
3. Copy and paste one of the contracts above
4. Compile the contract with Solidity compiler version 0.8.20 or higher
5. Deploy using the Deploy & Run Transactions tab:
   - For the upgradeable contract: Use the "Deploy with Proxy" option 
   - For the simple contract: Deploy directly with the constructor arguments

### Registering on KRNL

1. After deployment, copy your contract address
2. Visit the KRNL developer portal
3. Connect your wallet (the same one used for deployment)
4. Submit your dApp with:
   - Name: AssetBit KYC Verification
   - Contract address
   - Description and other required metadata

For any questions, please contact the AssetBit development team. 