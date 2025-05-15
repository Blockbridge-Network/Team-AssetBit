import { run } from "hardhat";

/**
 * Verifies a contract on Etherscan
 * @param contractAddress The address of the contract to verify
 * @param constructorArguments The constructor arguments (if any)
 */
export async function verify(contractAddress: string, constructorArguments: any[]) {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
    console.log("Contract verified successfully");
  } catch (error: any) {
    // If contract is already verified, don't treat it as an error
    if (error.message.includes("already verified")) {
      console.log("Contract is already verified!");
      return;
    }
    console.error("Error verifying contract:", error);
    throw error;
  }
} 