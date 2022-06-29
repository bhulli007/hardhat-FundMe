// this file is useful if you're working with multiple networks/blockchains

const networkConfig = {
    4: {
        name: "rinkeby",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },

};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
// eth Price as $1200
const INITIAL_ANSWER = 120000000000;

module.exports = {
    networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER
};