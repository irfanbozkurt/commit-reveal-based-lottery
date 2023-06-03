require("@nomicfoundation/hardhat-toolbox");

const privKey = "secret";

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  networks: {
    hardhat: {
      gas: 3000000,
      blockGasLimit: 210000000,
      chainId: 1337,
      allowUnlimitedContractSize: true,
      allowBlocksWithSameTimestamp: true,
      accounts: {
        count: 200,
      },
    },
    // fuji: {
    //   accounts: [`0x${privKey}`],
    //   url: "https://api.avax-test.network/ext/bc/C/rpc",
    //   gasPrice: 225000000000,
    //   chainId: 43113,
    // },
  },
};
