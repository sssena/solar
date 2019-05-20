var utils = require('./crp-test-utils.js');

// web3 init
utils.uWeb3("localhost", "8545");

// utils.unlock(utils.EOA[0], '1');
// console.log(utils.getTx(utils.sendTx(utils.EOA[0], utils.EOA[2], 10)));
var abi = utils.contract(utils.erc20abi);
var ca = abi.at("0xb6f476267d26dbe06b553dcab620005cb746bf84");
var symbol = ca.symbol;
console.log(symbol);
