const Web3 = require("./packages/web3");
const web3 = new Web3('ws://localhost:8546');

web3.eth.getAccounts().then(console.log);
