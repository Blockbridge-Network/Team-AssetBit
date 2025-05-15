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