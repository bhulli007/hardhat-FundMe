const { network } = require("hardhat");
const {developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments}) => {
    // we're getting deploy and log from deployments
    const {deploy, log } = deployments;
    // we're getting deployer from getNamedAccounts
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    // can use any of the following
    // if(chainId == 31337)
    if(developmentChains.includes(network.name)) {
        log("Local network Detected! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS,INITIAL_ANSWER],
        });
        log("Mocks deployed!");
        // adding a line so that we know that this deploy script is done
        log("--------------------------------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];