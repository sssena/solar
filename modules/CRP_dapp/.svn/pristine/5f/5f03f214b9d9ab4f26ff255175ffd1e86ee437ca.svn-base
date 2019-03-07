/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      // ethereum private network (for development)
      host: "172.17.0.2",
      port: 7080,
      network_id: "*",
    },
    test: {
      // ethereum private network (for unit test)
      host: "172.17.0.2",
      port: 7080,
      network_id: "*",
    },
    live: {
      // ethereum main net (do not allocate gasPrice)
      host: "192.168.0.215",
      port: 8546,
      network_id: "1",
    }
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : {
      currency: 'CHF',
      gasPrice: 21
    }
  }
};
