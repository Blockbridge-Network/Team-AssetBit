const hre = require("hardhat");

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
  
  console.log("Deployment completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 