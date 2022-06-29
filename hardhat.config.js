require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

// to use deploy
require("hardhat-deploy");

// || just to populate the var if we run into some error witht the keys
const rinkebyUrl = process.env.RINKEBY_RPC_URL || "https://eth-rinkeby";
const prvKey = process.env.PRIVATE_KEY || "0xkey";
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || "key";
const cmcapikey = process.env.COINMARKETCAP_API_KEY || "key";


module.exports = {
  // to use multiple versions of solidity
  // solidity: "0.8.8",
  solidity: {
    compilers: [
      {version: "0.8.8"}, 
      {version: "0.6.6"},
    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: rinkebyUrl,
      accounts: [prvKey],
      chainId: 4,
      blockConfirmations: 6,
    },
    // to use a local node in the terminal (this is different than defaultNetwork)
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    }
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: cmcapikey,
    // if we want to run on a different blockchain
    // token: "MATIC",
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
  namedAccounts: {
    deployer: {
      // the 0th index account is used by default
      default: 0,
    },
  },
};

