var utils = require('./crp-test-utils.js');

// web3 init
utils.uWeb3("192.168.0.133", "8545");

// wallet unlock
utils.unlock(utils.EOA[1]);
// utils.unlock(utils.EOA[0]);
// utils.unlock(utils.EOA[2]);

// getBalance
// console.log(utils.getMyCoin(utils.EOA[0]));

// getContractList
// console.log(utils.getCaList("http://192.168.0.133:8545", utils.erc20abi, "a"));
console.log(utils.searchCaList("http://192.168.0.133:8545", "a"));

// 이더 전송 (단위: Ether)
// var gas = utils.estimate({from:utils.EOA[0], to:utils.EOA[1], value:1000000000000000000 });
// console.log("estimate : " + gas);
// var gas1 = utils.estimate({from:utils.EOA[1], to:"0xd7357f6a2789f451861c93aa5f254f88af0f20b3", value:1000000000000000000 });
// console.log("estimate1 : " + gas1);
// var gas2 = utils.estimate({from:utils.EOA[2], to:"0xd7357f6a2789f451861c93aa5f254f88af0f20b3", value:1000000000000000000 });
// console.log("estimate2 : " + gas2);
// console.log(utils.sendTx(utils.EOA[0], utils.EOA[1], 100));
// console.log(utils.sendTx(utils.EOA[0], utils.EOA[2], 100));
// console.log(utils.sendTx(utils.EOA[0], utils.EOA[1], 100));

// console.log(utils.sendTx(utils.EOA[1], utils.EOA[2], 1));
// console.log(utils.getMyCoin(utils.EOA[1]));
// console.log(utils.getMyCoin(utils.EOA[2]));

// console.log("[ eoa00 ]", utils.estimate({from:utils.EOA[0], to:utils.EOA[1], value:1000000000000000000 })); // 1 ethe
// console.log("[ ca00 ]",utils.estimate({from:utils.EOA[0], to:"0xd7357f6a2789f451861c93aa5f254f88af0f20b3", value:1000000000000000000}));
// console.log("[ eoa01 ]", utils.estimate({from:utils.EOA[0], to:utils.EOA[1], value:10000000000000000000 })); // 10 ethe
// console.log("[ ca01 ]",utils.estimate({from:utils.EOA[0], to:"0xd7357f6a2789f451861c93aa5f254f88af0f20b3", value:10000000000000000000}));
// console.log("[ eoa02 ]", utils.estimate({from:utils.EOA[0], to:utils.EOA[1], value:99000000000000000000 })); // 99 ethe
// console.log("[ ca02 ]",utils.estimate({from:utils.EOA[0], to:"0xd7357f6a2789f451861c93aa5f254f88af0f20b3", value:99000000000000000000}));

// // TX 재전송
// console.log("\nresendTx");
// console.log(utils.reSendTx("0x82fd3f20e2615866cc3637f559afec14b3b6805f639c6b0d401bb7d8cadf2022"));

// // 해당 EOA에 관련된 모든 TX Hash를 반환합니다. (from or to)
// console.log("\ngetTxList");
// console.log(utils.getTxList(utils.EOA[0]));
//
//
// // 해당 EOA에 관련된 이더 전송 TX Hash를 반환합니다.
// console.log("\ngetEoaTxList");
// console.log(utils.getEoaTxList(utils.EOA[0]));
//
// // txList에서 contract tx를 필터링.
// console.log("\ngetContract");
// console.log(utils.filterContract(utils.EOA[0]));
//
// // erc20 전송 이력을 반환
// console.log("\ngetCaTxList");
// console.log(utils.getCaTxList("0x78c40df7968b0d78d909d8a3646a83a7d6a1b719", utils.EOA[0], 0));

// console.log(utils.getToAscii("0xa9059cbb0000000000000000000000004c8596af08ef22d3847704699e6ed8ec968da5810000000000000000000000000000000000000000000000000000000000000001"));

// eoa에 token 발행 권한이 있는지?
// console.log(utils.getPTx(utils.EOA[1]));

//eoa에 token 발행 권한을 주기.
// console.log(utils.sendPTx(utils.EOA[0], utils.EOA[1]));

// crp admin 변경.
// console.log(utils.setAdmin(utils.EOA[0]));

// crp admin 확인
// console.log(utils.getAdmin());

// MCA 확인
// console.log(utils.getMCA(utils.EOA[0]));

