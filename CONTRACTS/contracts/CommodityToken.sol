// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CommodityToken is ERC20, Ownable, Pausable {
    string public commodityType;
    uint256 public pricePerUnit;
    uint256 public totalSupplyCap;
    uint8 private _decimals;

    event PriceUpdated(uint256 newPrice);
    event SupplyCapUpdated(uint256 newCap);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _commodityType,
        uint256 _initialSupply,
        uint256 _pricePerUnit,
        uint256 _totalSupplyCap,
        uint8 _decimalPlaces
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        commodityType = _commodityType;
        pricePerUnit = _pricePerUnit;
        totalSupplyCap = _totalSupplyCap;
        _decimals = _decimalPlaces;
        
        // Mint initial supply to the contract deployer
        _mint(msg.sender, _initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(totalSupply() + amount <= totalSupplyCap, "Exceeds supply cap");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function burn(uint256 amount) external whenNotPaused {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    function updatePrice(uint256 newPrice) external onlyOwner {
        pricePerUnit = newPrice;
        emit PriceUpdated(newPrice);
    }

    function updateSupplyCap(uint256 newCap) external onlyOwner {
        require(newCap >= totalSupply(), "New cap must be >= current supply");
        totalSupplyCap = newCap;
        emit SupplyCapUpdated(newCap);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
} 