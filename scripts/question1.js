const hre = require("hardhat");
const { ethers } = hre;
const compiledUniswapFactory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const compiledWETH = require("canonical-weth/build/contracts/WETH9.json");
const compiledUniswapRouter = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const { MaxUint256, parseEther } = require("ethers");

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function main() {
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    // Deploy the Uniswap V2 Factory contract
    const factory = await new ethers.ContractFactory(
        compiledUniswapFactory.interface,
        compiledUniswapFactory.bytecode,
        deployer
    ).deploy(deployer.address);

    console.log(
        `Factory deployment transaction - ${factory.deploymentTransaction().hash}`
    );
    await factory.waitForDeployment();

    console.log("UniswapV2 Factory deployed at:", factory.target);

    // Deploy the WETH contract. (Using the canonnical WETH)
    const weth = await new ethers.ContractFactory(
        compiledWETH.abi,
        compiledWETH.bytecode,
        deployer
    ).deploy();

    console.log(
        `WETH deployment transaction - ${weth.deploymentTransaction().hash}`
    );

    await weth.waitForDeployment();

    console.log("WETH deployed at:", weth.target);

    // Deploy the UniswapV2 Router contract.
    const router = await new ethers.ContractFactory(
        compiledUniswapRouter.abi,
        compiledUniswapRouter.bytecode,
        deployer
    ).deploy(factory.target, weth.target);

    console.log(
        `Router deployment transaction - ${router.deploymentTransaction().hash}`
    );

    await router.waitForDeployment();

    console.log("UniswapV2 Router deployed at:", router.target);

    //Deploying TokenA and TokenB

    const TokenA = await ethers.getContractFactory("TokenA");
    const tokenA = await TokenA.deploy();

    console.log(
        `TokenA deployment transaction - ${tokenA.deploymentTransaction().hash}`
    );

    await tokenA.waitForDeployment();
    console.log("TokenA deployed at:", tokenA.target);

    const TokenB = await ethers.getContractFactory("TokenB");
    const tokenB = await TokenB.deploy();

    console.log(
        `TokenB deployment transaction - ${tokenB.deploymentTransaction().hash}`
    );

    await tokenB.waitForDeployment();
    console.log("TokenB deployed at:", tokenB.target);

    //Approving TokenA and TokenB to the Uniswap Router

    //Using access lists on approval tx did not seem to save gas. So removed

    const tokenAApprovalTx = await tokenA.approve(router.target, MaxUint256);
    console.log(`TokenA approval to Router Tx - ${tokenAApprovalTx.hash}`);
    await tokenAApprovalTx.wait();

    const tokenBApprovalTx = await tokenB.approve(router.target, MaxUint256);
    console.log(`TokenB approval to Router Tx - ${tokenBApprovalTx.hash}`);
    await tokenBApprovalTx.wait();

    //creating pair to use pair address as access list address

    const createPairTx = await factory.createPair(tokenA.target, tokenB.target);
    console.log(`Create pair Tx - ${createPairTx.hash}`);
    await createPairTx.wait();

    const pairAddress = await factory.getPair(tokenA.target, tokenB.target);
    console.log(`Pair Address for TokenA and TokenB is ${pairAddress}`);

    //Adding Liquidity

    //Saves Gas
    const addLiquidityOverrides = {
        type: 1,
        accessList: [
            {
                address: pairAddress,
                storageKeys: [
                    "0x0000000000000000000000000000000000000000000000000000000000000005",
                    "0x0000000000000000000000000000000000000000000000000000000000000006",
                    "0x0000000000000000000000000000000000000000000000000000000000000007",
                ],
            },
        ],
    };

    const addLiquidityTx = await router.addLiquidity(
        tokenA.target,
        tokenB.target,
        parseEther("100"),
        parseEther("500"),
        0,
        0,
        deployer.address,
        MaxUint256
        // addLiquidityOverrides
    );

    console.log(`Adding Liquidity Tx - ${addLiquidityTx.hash}`);

    await addLiquidityTx.wait();

    //Swap

    //Saves Gas
    const swapTxOverrides = {
        type: 1,
        accessList: [
            {
                address: pairAddress,
                storageKeys: [
                    "0x0000000000000000000000000000000000000000000000000000000000000006",
                    "0x0000000000000000000000000000000000000000000000000000000000000007",
                    "0x0000000000000000000000000000000000000000000000000000000000000008",
                    "0x0000000000000000000000000000000000000000000000000000000000000009",
                    "0x000000000000000000000000000000000000000000000000000000000000000c",
                ],
            },
        ],
    };

    const swapTx = await router.swapExactTokensForTokens(
        parseEther("50"),
        0,
        [tokenB.target, tokenA.target],
        deployer.address,
        MaxUint256
        // swapTxOverrides
    );

    console.log(`Swap Tx - ${swapTx.hash}`);

    await swapTx.wait();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });