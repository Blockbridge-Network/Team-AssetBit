import { expect } from "chai";
import hre from "hardhat";
import { Signer } from "ethers";
import { AssetBitKYCVerification } from "../typechain-types";

describe("AssetBitKYCVerification", function () {
  let kycVerification: AssetBitKYCVerification;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let tokenAuthority: Signer;
  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;
  let tokenAuthorityAddress: string;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, tokenAuthority] = await hre.ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
    tokenAuthorityAddress = await tokenAuthority.getAddress();

    // Deploy contract
    const AssetBitKYCVerification = await hre.ethers.getContractFactory("AssetBitKYCVerification", owner);
    kycVerification = await hre.upgrades.deployProxy(
      AssetBitKYCVerification,
      [ownerAddress, tokenAuthorityAddress],
      { kind: "uups", initializer: "initialize" }
    ) as unknown as AssetBitKYCVerification;

    await kycVerification.waitForDeployment();
  });

  describe("Initialization", function () {
    it("should set the correct owner", async function () {
      expect(await kycVerification.owner()).to.equal(ownerAddress);
    });

    it("should set the correct tokenAuthority", async function () {
      expect(await kycVerification.tokenAuthority()).to.equal(tokenAuthorityAddress);
    });
  });

  describe("KYC Verification", function () {
    it("should allow owner to verify a user", async function () {
      await kycVerification.verifyUser(user1Address);
      expect(await kycVerification.isKYCVerified(user1Address)).to.be.true;
    });

    it("should emit KYCVerified event when verifying a user", async function () {
      await expect(kycVerification.verifyUser(user1Address))
        .to.emit(kycVerification, "KYCVerified")
        .withArgs(user1Address, ownerAddress);
    });

    it("should prevent non-owner from verifying a user", async function () {
      await expect(kycVerification.connect(user1).verifyUser(user2Address))
        .to.be.revertedWithCustomError(kycVerification, "OwnableUnauthorizedAccount");
    });

    it("should revert when trying to verify already verified user", async function () {
      await kycVerification.verifyUser(user1Address);
      await expect(kycVerification.verifyUser(user1Address))
        .to.be.revertedWith("User already KYC verified");
    });

    it("should revert when trying to verify zero address", async function () {
      await expect(kycVerification.verifyUser(hre.ethers.ZeroAddress))
        .to.be.revertedWith("Invalid user address");
    });
  });

  describe("KYC Revocation", function () {
    beforeEach(async function () {
      // Verify user1 for revocation tests
      await kycVerification.verifyUser(user1Address);
    });

    it("should allow owner to revoke verification", async function () {
      await kycVerification.revokeVerification(user1Address);
      expect(await kycVerification.isKYCVerified(user1Address)).to.be.false;
    });

    it("should emit KYCRevoked event when revoking verification", async function () {
      await expect(kycVerification.revokeVerification(user1Address))
        .to.emit(kycVerification, "KYCRevoked")
        .withArgs(user1Address, ownerAddress);
    });

    it("should prevent non-owner from revoking verification", async function () {
      await expect(kycVerification.connect(user1).revokeVerification(user1Address))
        .to.be.revertedWithCustomError(kycVerification, "OwnableUnauthorizedAccount");
    });

    it("should revert when trying to revoke non-verified user", async function () {
      await expect(kycVerification.revokeVerification(user2Address))
        .to.be.revertedWith("User not KYC verified");
    });
  });

  describe("Batch Verification", function () {
    it("should verify multiple users in batch", async function () {
      await kycVerification.verifyBatch([user1Address, user2Address]);
      expect(await kycVerification.isKYCVerified(user1Address)).to.be.true;
      expect(await kycVerification.isKYCVerified(user2Address)).to.be.true;
    });

    it("should skip zero addresses in batch verification", async function () {
      await kycVerification.verifyBatch([user1Address, hre.ethers.ZeroAddress, user2Address]);
      expect(await kycVerification.isKYCVerified(user1Address)).to.be.true;
      expect(await kycVerification.isKYCVerified(hre.ethers.ZeroAddress)).to.be.false;
      expect(await kycVerification.isKYCVerified(user2Address)).to.be.true;
    });

    it("should skip already verified users in batch verification", async function () {
      await kycVerification.verifyUser(user1Address);
      await kycVerification.verifyBatch([user1Address, user2Address]);
      expect(await kycVerification.isKYCVerified(user1Address)).to.be.true;
      expect(await kycVerification.isKYCVerified(user2Address)).to.be.true;
    });
  });

  describe("Token Authority", function () {
    it("should allow owner to update token authority", async function () {
      const newAuthority = await user2.getAddress();
      await expect(kycVerification.setTokenAuthority(newAuthority))
        .to.emit(kycVerification, "TokenAuthorityUpdated")
        .withArgs(tokenAuthorityAddress, newAuthority);
      
      expect(await kycVerification.tokenAuthority()).to.equal(newAuthority);
    });

    it("should prevent setting zero address as token authority", async function () {
      await expect(kycVerification.setTokenAuthority(hre.ethers.ZeroAddress))
        .to.be.revertedWith("Invalid authority address");
    });

    it("should prevent non-owner from updating token authority", async function () {
      await expect(kycVerification.connect(user1).setTokenAuthority(user2Address))
        .to.be.revertedWithCustomError(kycVerification, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pausable Functionality", function () {
    it("should allow owner to pause the contract", async function () {
      await kycVerification.pause();
      await expect(kycVerification.verifyUser(user1Address))
        .to.be.revertedWithCustomError(kycVerification, "EnforcedPause");
    });

    it("should allow owner to unpause the contract", async function () {
      await kycVerification.pause();
      await kycVerification.unpause();
      await kycVerification.verifyUser(user1Address);
      expect(await kycVerification.isKYCVerified(user1Address)).to.be.true;
    });

    it("should prevent non-owner from pausing the contract", async function () {
      await expect(kycVerification.connect(user1).pause())
        .to.be.revertedWithCustomError(kycVerification, "OwnableUnauthorizedAccount");
    });
  });

  describe("UUPS Upgradeability", function () {
    it("should prevent non-owner from upgrading implementation", async function () {
      const AssetBitKYCVerificationV2 = await hre.ethers.getContractFactory("AssetBitKYCVerification", user1);
      await expect(
        hre.upgrades.upgradeProxy(await kycVerification.getAddress(), AssetBitKYCVerificationV2)
      ).to.be.reverted;
    });

    // Note: To properly test upgrades, we would need a V2 contract implementation
    // This test is a placeholder for that scenario
  });
}); 