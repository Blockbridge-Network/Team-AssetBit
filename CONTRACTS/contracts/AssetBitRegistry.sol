// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AssetBitRegistry {
    struct Asset {
        string name;
        string description;
        address owner;
    }

    mapping(uint256 => Asset) public assets;
    uint256 public assetCount;

    event AssetRegistered(uint256 indexed assetId, string name, address indexed owner);
    event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to);

    function registerAsset(string calldata name, string calldata description) external {
        assetCount++;
        assets[assetCount] = Asset({
            name: name,
            description: description,
            owner: msg.sender
        });
        emit AssetRegistered(assetCount, name, msg.sender);
    }

    function transferAsset(uint256 assetId, address newOwner) external {
        Asset storage asset = assets[assetId];
        require(asset.owner == msg.sender, "Only owner can transfer");
        address oldOwner = asset.owner;
        asset.owner = newOwner;
        emit AssetTransferred(assetId, oldOwner, newOwner);
    }

    function getAsset(uint256 assetId) external view returns (string memory, string memory, address) {
        Asset storage asset = assets[assetId];
        return (asset.name, asset.description, asset.owner);
    }
} 