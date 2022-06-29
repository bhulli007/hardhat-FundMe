
// how we normally set up a function
/*
function deployFunc() {
    console.log("Hi!");
}
module.exports.default = deployFunc;
*/

// to verify on etherscan
const {verify} = require("../utils/verify");

const { network } = require("hardhat");

// how we can do it differently
/*
module.exports = async (hre) => {
    const { getNamedAccounts, deployments} = hre
};
*/

// importing networkConfig
const { networkConfig, developmentChains } = require("../helper-hardhat-config");

// we can use any of the three syntax 
module.exports = async ({ getNamedAccounts, deployments}) => {
    // we're getting deploy, log and get from deployments
    const {deploy, log, get } = deployments;
    // we're getting deployer from getNamedAccounts
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    // we don't want it to be a const
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    let ethUsdPriceFeedAddress; 
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    }
    else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const args = [ethUsdPriceFeedAddress];

    // we'll use a mock to use the datafeed from rinkeby
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name && process.env.ETHERSCAN_API_KEY )) {
        await verify(fundMe.address, args);
    }





    log("--------------------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];