const fs = require('fs'); // file-system
const path = require('path'); // path-package
let args_dir = path.resolve(__dirname, 'args');
let init_params = fs.readFileSync(args_dir + '/init.json', 'utf8');
let init = JSON.parse(init_params);
const provider = init.provider;
const voter = process.argv[2];
const passwd = process.argv[3];
const roadmap_address = process.argv[4];
const vote_boolean = process.argv[5];
let web3_path = (init.web3 == 'null') ? ('web3') : (init.web3);
/* web3 provider 설정 */
const Web3 = require(web3_path); // web3 api
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider)); // set provider
/* deploy에 필요한 요소들 추출 (abi, data, gas) */

let abi_path = path.resolve(__dirname, 'abi', 'CrpPollRoadmap.abi'); // abi가 저장된 file path
let abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
let road = web3.eth.contract(JSON.parse(abi)); // get contract
let roadmap_contract = road.at(roadmap_address);

let gas;

/**
 * 지정된 시간(ms)만큼 대기한다.  
 *
 * @param _ms 지정한 시간 (ms)
 * @return promise object
 * @author jhhong
 */
function milisleep(_ms) {
    return new Promise(resolve => setTimeout(resolve, _ms));
}
/**
 * CrpMain Contract deploy를 수행하는 함수이다. 아래의 절차에 따라 진행된다.
 * 1. unlock Account 수행
 * 2. Main.new 수행
 * 3. getTransactionReceipt를 통해, 발행된 tx가 블록에 실렸는지 확인
 * 4. lock Account 수행
 * 
 * @author sykang
 */
let pollRoad = async () => {
    try {
        await milisleep(1000);
        await web3.personal.unlockAccount(voter, passwd); // Unlock Account 

        
        let boolean;
        if(vote_boolean == "false"){
            boolean = Number(0);
        }else if(vote_boolean == "true"){
            boolean = Number(1);
        }
        console.log("poll of roadmap by holder .....");
        gas = await roadmap_contract.polling.estimateGas(boolean, {
            from: voter
        });
        let tx = await roadmap_contract.polling(boolean, {
            from: voter,
            gas: gas
        });

        let receipt; // receipt object를 받을 변수 

        console.log('TX Hash=[' + tx + ']');
        do {
            receipt = await web3.eth.getTransactionReceipt(tx); // receipt 확인
            if (receipt) {
                console.log("Included in the Block = [" + receipt.blockNumber + "] HASH = [" + receipt.blockHash + "]!");
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);

        await web3.personal.lockAccount(voter); // Lock Account
    } catch (err) {
        console.log(err);
    }
}
/**
 * 프로시져 수행 메인 함수이다.
 * 
 * 1. clear screen
 * 2. poll_staff
 * 
 * @author jhhong
 */
let RunProc = async () => {
    try {
        console.clear();
        /* 파라메터 체크 */
        console.log('* param1 (provider):.......' + init.provider);
        console.log('* param2 (web3 path):......' + init.web3);
        console.log('* param3 (voter account):..' + process.argv[2]);
        console.log('* param4 (voter password):.' + process.argv[3]);
        console.log('* param5 (roadmap contract):..' + process.argv[4]);
        console.log('* param6 (vote boolean):...' + process.argv[5]);
        await pollRoad();
    } catch(err) {}
}
RunProc();