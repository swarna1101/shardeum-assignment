/* eslint-disable no-process-exit */
const hre = require("hardhat");

async function main() {
    // We get the contract to deploy
    const GasHungry = await hre.ethers.getContractFactory("GasHungry");
    const contractInstance = await GasHungry.deploy();

    console.log(
        `GasHungry deployment transaction - ${
            contractInstance.deploymentTransaction().hash
        }`
    );
    console.log(await contractInstance.deploymentTransaction().wait());
    console.log(await contractInstance.waitForDeployment());

    console.log("GasHungry contract deployed at:", contractInstance.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });