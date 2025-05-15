import hre from "hardhat";
import { verify } from "./utils/verify";

async function main() {
  console.log("Deploying AssetBitKYCVerification contract...");

  // In a real deployment, this would be the actual TokenAuthority address
  // For now, we'll use a placeholder address
  const placeholderTokenAuthority = "0x0000000000000000000000000000000000000001";
  
  const AssetBitKYCVerification = await hre.ethers.getContractFactory("AssetBitKYCVerification");
  
  // Get the deployer address
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying with account:", deployer.address);
  
  // Deploy as a UUPS proxy
  const proxy = await hre.upgrades.deployProxy(
    AssetBitKYCVerification, 
    [
      deployer.address, // initial owner
      placeholderTokenAuthority // token authority address
    ],
    { 
      kind: "uups",
      initializer: "initialize"
    }
  );

  await proxy.waitForDeployment();
  
  const proxyAddress = await proxy.getAddress();
  console.log("AssetBitKYCVerification proxy deployed to:", proxyAddress);
  
  // Get the implementation address
  const implementationAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Implementation address:", implementationAddress);
  
  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await proxy.deploymentTransaction()?.wait(5);
  
  // Verify the implementation contract on Etherscan (if on a public network)
  try {
    console.log("Verifying implementation contract...");
    await verify(implementationAddress, []);
    console.log("Implementation contract verified");
  } catch (error) {
    console.log("Verification failed:", error);
  }
  
  console.log("Deployment completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 