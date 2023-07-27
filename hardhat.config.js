require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-web3");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        localhost: {
            url: "http://localhost:8545",
        },
        shardeum: {
            url: process.env.RPC_URL,
            accounts: [`0x${process.env.PRIVATE_KEY}`],
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
    },
};