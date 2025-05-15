// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KYCRegistry {
    address public admin;
    mapping(address => bool) public isKycCompleted;

    event KycCompleted(address indexed user);
    event KycRevoked(address indexed user);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function completeKyc(address user) external onlyAdmin {
        isKycCompleted[user] = true;
        emit KycCompleted(user);
    }

    function revokeKyc(address user) external onlyAdmin {
        isKycCompleted[user] = false;
        emit KycRevoked(user);
    }

    function checkKyc(address user) external view returns (bool) {
        return isKycCompleted[user];
    }
} 