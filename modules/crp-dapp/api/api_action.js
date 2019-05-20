let conf = require("./settings.js");
let provider = require("./provider.js");
let utils = require("./utils.js");
let txbatch = new Array();

/**
 * Transaction 재전송을 수행하는 함수이다.
 * GasPrice를 20%만큼 올려 재전송한다.
 *
 * @param _txid 재전송할 트랜잭션 ID
 * @param _owner 재전송을 수행하는 주체 Account
 * @param _passwd _owner의 암호
 * @param _deploy 컨트랙트 디플로이를 위한 함수호출인지 여부를 가리기 위한 플래그 변수
 * @return 성공 시 "0", 실패 시 생성한 txid를 반환
 * @author jhhong
 */
async function retryTx(_txid, _owner, _passwd, _deploy) {
    try {
        let count = 0;
        let txobj = await provider.web3.eth.getTransaction(_txid);
        if(!txobj) {
            throw new Error("txobj is null in getTransaction()!");
        }
        let gas_price = txobj.gasPrice.toNumber(10); // 바로 txobj.gasPrice 값으로 연산하면 string으로 취급되어 append됨.
        console.log("....GasPrice <OLD>= [", txobj.gasPrice.toString(10), "]");
        txobj.gasPrice = gas_price + (gas_price / 5); // 20% 증가
        console.log("....GasPrice <NEW>= [", txobj.gasPrice.toString(10), "]");
        await provider.web3.personal.unlockAccount(_owner, _passwd); // unlock Account
        let tx = await provider.web3.eth.sendTransaction(txobj); // tx 생성
        console.log('<<재전송>> New TX Hash=[' + tx + ']');
        let receipt;
        do {
            receipt = await provider.web3.eth.getTransactionReceipt(tx); // 블록에 실렸는지 확인
            if (receipt) {
                console.log("블록 탑재 성공!");
                console.log("....TX가 포함된 블록넘버 = [" +  receipt.blockNumber + "] 블록해시 = [" +receipt.blockHash + "]!");
                break;
            }
            console.log("TX[\"" + tx + "\"] 가 블록에 탑재때까지 대기중... 블록넘버 = [" + provider.web3.eth.blockNumber + "]");
            await utils.milisleep(conf.check_intval);
        } while (++count < conf.check_count);
        await provider.web3.personal.lockAccount(_owner); // lock Account
        if(count < conf.check_count) {
            return (_deploy)? (receipt.contractAddress) : ("0");
        } else {
            return tx;
        }
    } catch (err) {
        console.log(err);
        if(err.message == "nonce too low") { // 재전송 중인 tx가 정상 처리 되어 nonce 값이 증가되었음
            return "0"; // 따라서 "정상 처리"를 리턴
        }
    }
}

/**
 * txbatch에 들어있는 모든 tx가 블록에 실릴 때까지 모니터링 한다.
 *
 * @param _cbptr 진행상태 체크를 위한 display 함수 포인터 ("결과", "현재 tx인덱스", "총 tx인덱스", "현재 tx인덱스의 재시도 횟수"))
 * @param _owner Action을 수행하는 주체 Account
 * @param _passwd _owner의 암호
 * @return 성공 시 "0", 실패 시 생성한 txid를 반환
 * @author jhhong
 */
module.exports.batchDeploy = async function(_cbptr, _owner, _passwd) {
    try {
        let idx = 0; // txbatch elmt 인덱스
        console.log("일괄처리 해야 할 Tx 총 개수 = [" + txbatch.length + "]");
        let receipt;
        for(idx = 0; idx < txbatch.length; idx++) { // txbatch에 들어있는 tx들 전체에 대해 하기의 코드 수행
            let count = 0;
            let retry = 0;
            do { // tx가 블록에 실렸는지 확인 (conf.check_intval 주기로 conf.check_count회 반복)
                receipt = await provider.web3.eth.getTransactionReceipt(txbatch[idx]);
                if (receipt) {
                    console.log("블록 탑재 성공!");
                    console.log("....TX [\"" + txbatch[idx] + "]가 포함된 블록넘버 = [" +  receipt.blockNumber + "] 블록해시 = [" +receipt.blockHash + "]!");
                    break;
                }
                console.log("TX [\"" + txbatch[idx] + "\"] 가 블록에 탑재때까지 대기중... 블록넘버 = [" + provider.web3.eth.blockNumber + "]");
                await utils.milisleep(conf.check_intval);
            } while (++count < conf.check_count);
            if(count < conf.check_count) { // 블록에 실렸을 경우, 다음 tx로 넘어감
                _cbptr(true, idx, txbatch.length, retry);
                continue;
            }
            retry++;
            let txid = txbatch[idx];
            do { // 블록에 실리지 못했을 경우 하기의 재전송 코드 수행
                txid = await retryTx(txid, _owner, _passwd);
                if(txid == "0") {
                    _cbptr(true, idx, txbatch.length, retry);
                    break;
                }
                _cbptr(false, idx, txbatch.length, retry);
            } while(retry++ < conf.retry_count);
            if(retry >= conf.retry_count) { // 재전송 조차도 실패할 경우, 루프 중단
                break;
            }
        }
        let result = (idx == txbatch.length)? (true) : (false);
        txbatch.splice(0, idx); // 처리된 tx들만 txbatch에서 제거
        return result; // 다 처리되었으면 true를, 처리되지 못한 tx가 존재하면 false를 반환
    } catch (err) {}
}

/**
 * Action이 성공될 때까지, 주어진 횟수만큼 반복 실행한다.
 *
 * @param _funcptr 수행할 Action
 * @param _cbptr 진행 경과를 알리기 위한 콜백함수 포인터 ("결과", "재시도 횟수")
 * @param _deploy 컨트랙트 디플로이를 위한 함수호출인지 여부를 가리기 위한 플래그 변수
 * @param _arg_num Action(_funcptr)에 필요한 Argument 개수
 * @param _wait 블럭에 실릴 때까지 기다릴지 여부
 * @param _owner Action을 수행하는 주체 Account
 * @param _passwd _owner의 암호
 * @return 성공 시 "0", 실패 시 생성한 txid를 반환
 * @author jhhong
 */
module.exports.tryActions = async function (_funcptr, _cbptr, _deploy, _arg_num, _wait, _owner, _passwd) {
    try {
        let txid; // 생성한 트랜잭션 ID를 저장할 변수
        let count = 0; // 재전송 횟수 카운트
        if(arguments.length != (_arg_num + 4)) {
            throw new Error("Invalid Arguments!");
        }
        if(_deploy && !_wait) { // Deploy tx인데 wait가 false인 경우는 허용하지 않음
            throw new Error("Invalid Deploy && wait!");
        }
        switch(_arg_num) { // _funcptr 호출
            case 3:
            txid = await _funcptr(_wait, _owner, _passwd);
            break;
            case 4:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7]);
            break;
            case 5:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], arguments[8]);
            break;
            case 6:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], arguments[8], arguments[9]);
            break;
            case 7:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], arguments[8], arguments[9], arguments[10]);
            break;
            case 8:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], arguments[8], arguments[9], arguments[10], arguments[11]);
            break;
            case 9:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], 
                arguments[8],  arguments[9],  arguments[10], arguments[11], arguments[12]);
            break;
            case 10:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], arguments[8], 
                arguments[9],  arguments[10], arguments[11], arguments[12], arguments[13]);
            break;
            case 11:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], arguments[8], arguments[9], 
                arguments[10], arguments[11], arguments[12], arguments[13], arguments[14]);
            break;
            case 12:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], arguments[8], arguments[9], arguments[10], 
                arguments[11], arguments[12], arguments[13], arguments[14], arguments[15]);
            break;
            case 13:
            txid = await _funcptr(_wait, _owner, _passwd, arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], 
                arguments[12], arguments[13], arguments[14], arguments[15], arguments[16]);
            break;
            default:
            console.log("Error: 지원하지 않는 Argument 개수!")
            return false;
        }
        if(_wait) { // 블록에 올라간 걸 확인하고 종료 --> 재전송 코드와 연동해야 함
            if(txid == "0" || txid.length == 42) {
                _cbptr(true, count, txid);
                return true;
            }
            _cbptr(false, count);
        } else { // 블록에 올라간 걸 확인하지 않고 종료 --> txid를 txbatch에 넣고 종료함
            if(txid != "0") {
                txbatch.push(txid);
                return true;
            }
            return false;
        }
        count++;
        do { // 재전송 코드
            txid = await retryTx(txid, _owner, _passwd, _deploy);
            if(txid == "0" || txid.length == 42) {
                _cbptr(true, count, txid);
                return true;
            }
            _cbptr(false, count);
        } while(count++ < conf.retry_count);
        return false; // 재전송 조차도 실패할 경우, false 반환
    } catch(err) {}
}