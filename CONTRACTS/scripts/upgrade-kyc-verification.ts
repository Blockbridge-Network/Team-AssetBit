import hre from "hardhat";
import { verify } from "./utils/verify";

async function main() {
  // Address of the proxy contract that was deployed previously
  const proxyAddress = process.env.KYC_PROXY_ADDRESS;
  
  if (!proxyAddress) {
    throw new Error("KYC_PROXY_ADDRESS environment variable not set");
  }
  
  console.log("Upgrading AssetBitKYCVerification contract...");

  // Get the contract factory for the new implementation
  // In the future, this would be a new contract with additional functionality
  // For now, we're just using the same contract
  const AssetBitKYCVerification = await hre.ethers.getContractFactory("AssetBitKYCVerification");
  
  // Get the deployer address
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Upgrading with account:", deployer.address);
  console.log("Proxy address:", proxyAddress);
  
  // Upgrade the proxy to the new implementation
  const upgraded = await hre.upgrades.upgradeProxy(proxyAddress, AssetBitKYCVerification);
  
  console.log("Waiting for transaction confirmation...");
  await upgraded.deploymentTransaction()?.wait(5);
  
  // Get the implementation address
  const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("New implementation address:", implementationAddress);
  
  // Verify the new implementation contract
  try {
    console.log("Verifying implementation contract...");
    await verify(implementationAddress, []);
    console.log("Implementation contract verified");
  } catch (error) {
    console.log("Verification failed:", error);
  }
  
  console.log("Upgrade completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 