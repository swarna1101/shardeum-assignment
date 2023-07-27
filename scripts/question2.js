const hre = require("hardhat");
const { ethers, upgrades } = hre;

async function main() {
    //Deploying Upgradeable ERC20 contract

    const Upgradeable = await ethers.getContractFactory("Upgradeable");
    const upgradeable = await upgrades.deployProxy(Upgradeable, []);

    await upgradeable.waitForDeployment();
    console.log("Upgradeable deployed to:", upgradeable.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });