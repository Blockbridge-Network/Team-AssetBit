import { ethers } from "hardhat";

async function main() {
  const AssetBitRegistry = await ethers.getContractFactory("AssetBitRegistry");
  const registry = await AssetBitRegistry.deploy();
  await registry.deployed();
  console.log("AssetBitRegistry deployed to:", registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 