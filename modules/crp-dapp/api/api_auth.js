let conf = require("./settings.js");
let provider = require("./provider.js");
let utils = require("./utils.js");

/**
 * 프로젝트 생성 권한을 부여할 "권한할당 tx"를 생성하는 함수이다.
 * 반드시 local wallet에 Crp Admin 계정이 존재해야 한다.
 * 아래의 절차에 따라 진행된다.
 * 1. Crp Admin 주소가 local wallet에 존재하는지 확인
 * 2. unlock Account 수행
 * 3. Gas 측정
 * 4. Tx 발행 (sendPermissionTx)
 * 5. 발행된 tx가 블록에 실렸는지 확인
 * 6. lock Account 수행
 * 
 * @param _wait 블럭에 실릴 때까지 기다릴지 여부
 * @param _owner Crp Admin Account
 * @param _passwd Crp Admin Account 암호
 * @param _target 프로젝트 생성 권한을 부여할 계정
 * @author jhhong
 */
let authorize = async function(_wait, _owner, _passwd, _target) {
    try {
        let count = 0;
        if(!provider.web3.eth.isAccount(provider.web3.eth.getAdminAddress())) { // 1. Crp Admin 주소가 local wallet에 존재하는지 확인
            throw new Error('[' + provider.web3.eth.getAdminAddress() + '] is not exist in the local wallet!');
        }
        let owner = provider.web3.eth.getAdminAddress(); // CRP Admin 계정 추출
        if(owner != _owner) {
            throw new Error('Invalid Param (owner is not Crp Admin)!');
        }
        console.log("authorize 수행 중...");
        await provider.web3.personal.unlockAccount(owner, _passwd); // 2. unlock Account 수행
        let gas = provider.web3.eth.estimateGas({from: owner}); // 3. Gas 측정
        console.log("측정된 가스값 ==> [" + gas + "]");
        let tx = provider.web3.eth.sendPermissionTx(owner, _target, gas); // 4. Tx 발행 (sendPermissionTx)
        console.log('TX Hash=[' + tx + ']');
        if(_wait) {
            let receipt;
            do {
                receipt = await provider.web3.eth.getTransactionReceipt(tx); // 5. 발행된 tx가 블록에 실렸는지 확인
                if(receipt) {
                    console.log("블록 탑재 성공!");
                    console.log("....TX가 포함된 블록넘버 = [" +  receipt.blockNumber + "] 블록해시 = [" + receipt.blockHash + "]!");
                    break;
                }
                console.log("TX[\"" + tx + "\"] 가 블록에 실릴때까지 대기중... 블록넘버 = [" + provider.web3.eth.blockNumber + "]");
                await utils.milisleep(conf.check_intval);
            } while(++count < conf.check_count);
        }
        await provider.web3.personal.lockAccount(owner); // 6. lock Account 수행
        return (_wait && count < conf.check_count)? ("0") : (tx);
    } catch(err) {
        console.log(err);
        return ("0");
    }
}
/* exports 선언 */
module.exports.authorize = authorize;