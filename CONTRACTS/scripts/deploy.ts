import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Gold Token
  const GoldToken = await ethers.getContractFactory("CommodityToken");
  const goldToken = await GoldToken.deploy(
    "Gold Token",
    "XAU",
    "Gold",
    ethers.parseUnits("1000", 18), // Initial supply: 1000 tokens
    ethers.parseUnits("1950", 18), // Price per unit: $1950
    ethers.parseUnits("1000000", 18), // Total supply cap: 1,000,000 tokens
    18 // Decimals
  );
  await goldToken.waitForDeployment();
  console.log("Gold Token deployed to:", await goldToken.getAddress());

  // Deploy Silver Token
  const SilverToken = await ethers.getContractFactory("CommodityToken");
  const silverToken = await SilverToken.deploy(
    "Silver Token",
    "XAG",
    "Silver",
    ethers.parseUnits("10000", 18), // Initial supply: 10,000 tokens
    ethers.parseUnits("24.75", 18), // Price per unit: $24.75
    ethers.parseUnits("10000000", 18), // Total supply cap: 10,000,000 tokens
    18 // Decimals
  );
  await silverToken.waitForDeployment();
  console.log("Silver Token deployed to:", await silverToken.getAddress());

  // Deploy Oil Token
  const OilToken = await ethers.getContractFactory("CommodityToken");
  const oilToken = await OilToken.deploy(
    "Oil Token",
    "OIL",
    "Oil",
    ethers.parseUnits("1000", 18), // Initial supply: 1000 tokens
    ethers.parseUnits("78.50", 18), // Price per unit: $78.50
    ethers.parseUnits("1000000", 18), // Total supply cap: 1,000,000 tokens
    18 // Decimals
  );
  await oilToken.waitForDeployment();
  console.log("Oil Token deployed to:", await oilToken.getAddress());

  // Deploy Cocoa Token
  const CocoaToken = await ethers.getContractFactory("CommodityToken");
  const cocoaToken = await CocoaToken.deploy(
    "Cocoa Token",
    "COCOA",
    "Cocoa",
    ethers.parseUnits("1000", 18), // Initial supply: 1000 tokens
    ethers.parseUnits("3200", 18), // Price per unit: $3200
    ethers.parseUnits("1000000", 18), // Total supply cap: 1,000,000 tokens
    18 // Decimals
  );
  await cocoaToken.waitForDeployment();
  console.log("Cocoa Token deployed to:", await cocoaToken.getAddress());

  // Deploy Coffee Token
  const CoffeeToken = await ethers.getContractFactory("CommodityToken");
  const coffeeToken = await CoffeeToken.deploy(
    "Coffee Token",
    "COFFEE",
    "Coffee",
    ethers.parseUnits("1000", 18), // Initial supply: 1000 tokens
    ethers.parseUnits("180.25", 18), // Price per unit: $180.25
    ethers.parseUnits("1000000", 18), // Total supply cap: 1,000,000 tokens
    18 // Decimals
  );
  await coffeeToken.waitForDeployment();
  console.log("Coffee Token deployed to:", await coffeeToken.getAddress());

  // Deploy Cashew Token
  const CashewToken = await ethers.getContractFactory("CommodityToken");
  const cashewToken = await CashewToken.deploy(
    "Cashew Token",
    "CASHEW",
    "Cashew",
    ethers.parseUnits("1000", 18), // Initial supply: 1000 tokens
    ethers.parseUnits("4500", 18), // Price per unit: $4500
    ethers.parseUnits("1000000", 18), // Total supply cap: 1,000,000 tokens
    18 // Decimals
  );
  await cashewToken.waitForDeployment();
  console.log("Cashew Token deployed to:", await cashewToken.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 