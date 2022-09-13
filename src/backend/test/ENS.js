const assert = require("assert");
const BN = require("bn.js");
const {expect} = require("chai");
const {ethers} = require("hardhat");
const namehash = require("eth-ens-namehash");
const sha = require("js-sha3");

let ensExchange, ensRegistry, registrar, add2;
let owner, provider;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
// test on goerli - npx hardhat test --network goerli

beforeEach(async () => {
  const accounts = await ethers.getSigners();
  owner = accounts[0];
  add2 = accounts[1];
  provider = ethers.provider;

  console.log("deploying...");
  // deploy registry
  const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
  ensRegistry = await ENSRegistry.deploy();
  console.log("Registry => ", ensRegistry.address);

  // deploy BaseRegistrarImplementation
  const BaseRegistrarImplementation = await ethers.getContractFactory("BaseRegistrarImplementation");
  registrar = await BaseRegistrarImplementation.deploy(ensRegistry.address, namehash.hash("0"));
  console.log("Registrar => ", registrar.address);
  console.log("nameHash", namehash.hash("0"));

  // deploy exchange
  const ENSExchange = await ethers.getContractFactory("EnsExchange");
  ensExchange = await ENSExchange.deploy(registrar.address);
  console.log("Exchange => ", ensExchange.address);
});

describe("ENS deployment", function () {
  it("confirm exchange is empty", async function () {
    // Exchange is empty
    expect(await ensExchange.itemCount()).to.eq(0);
    // No items listed for sale
    await expect(ensExchange.listENS("001.eth", 0, 1)).to.be.revertedWith("No items available to list");
  });

  it("Registers a domain", async function () {
    // test contract functions
    let tokenId = 1;
    let node = namehash.hash("alice.eth");

    // Set Subnode owner
    expect(await registrar.callStatic.owner()).to.eq(owner.address);
    await ensRegistry.connect(owner).setSubnodeOwner(ZERO_HASH, "0x" + sha.keccak256("0"), registrar.address);
    expect(await ensRegistry.owner(ZERO_HASH)).to.eq(owner.address);

    // Add Controller
    await registrar.addController(owner.address);
    // Register ENS
    await registrar.register(tokenId, owner.address, 1000);

    expect(await registrar.ownerOf(tokenId)).to.eq(owner.address);
    expect(await ensExchange.callStatic.available(tokenId)).to.eq(false);
    expect(await ensExchange.callStatic.balanceOf(owner.address)).to.eq(1);
  });
});
