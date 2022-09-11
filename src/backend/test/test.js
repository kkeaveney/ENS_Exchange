const assert = require("assert");
const BN = require("bn.js");

const {expect} = require("chai");
const {ethers} = require("hardhat");

let ensName;
let deployer, provider, signer;
const ENSContractAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";

// test on goerli - npx hardhat test --network goerli

beforeEach(async () => {
  const accounts = await ethers.getSigners();
  deployer = accounts[0];
  provider = ethers.provider;
});

describe("ENS deployment", function () {
  it("confirm balances", async function () {
    var address = await provider.resolveName("marzel.eth");
    console.log(address);
    let balance = await provider.getBalance(address);
    console.log(balance);
  });
});
