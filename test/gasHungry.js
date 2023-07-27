/* eslint-disable no-process-exit */
const hre = require("hardhat");

describe("Gas Hungry", function () {
    it("Should output the gas report", async function () {
        const GasHungry = await hre.ethers.getContractFactory("GasHungry");
        const contractInstance = await GasHungry.deploy();

        console.log("GasHungry contract deployed at:", contractInstance.target);
    });
});