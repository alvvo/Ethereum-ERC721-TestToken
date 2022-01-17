const HDWalletProvider = require('@truffle/hdwallet-provider');
const PrivateKeyProvider = require("truffle-privatekey-provider");

const mnemonic = require("./mnemonics/master_seed.json").mnemonic;
const privateKey = "";

module.exports = {
  networks: {
    ropsten_hd: {
    provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/073c2f15d32e48b199671b57f9a87e7a`, 1),
    network_id: 3,       // Ropsten's id
    confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    ropsten_main: {
      provider: () => new PrivateKeyProvider(privateKey, "https://ropsten.infura.io/v3/073c2f15d32e48b199671b57f9a87e7a"),
      network_id: 3,       // Ropsten's id
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    ropsten_test: {
      provider: () => new PrivateKeyProvider(privateKey2, "https://ropsten.infura.io/v3/073c2f15d32e48b199671b57f9a87e7a"),
      network_id: 3,       // Ropsten's id
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },

  mocha: {
  },

  compilers: {
    solc: {
      version: "0.8.11",
    }
  },
};
