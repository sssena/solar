const fs = require('fs'); // file-system
const path = require('path'); // path-package
let args_dir = path.resolve(__dirname, 'args'); // argument file이 위치한 directory path
let params = fs.readFileSync(args_dir + '/deploy_CrpMain.json');
let args = JSON.parse(params);
const provider = args.provider;
const owner = args.owner;
const passwd = args.password;
const title = args.title;
let web3_path = (args.web3 == 'null')? ('web3') :(args.web3);
/* web3 provider 설정 */
const Web3 = require(web3_path); // web3 api
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider)); // set provider
/* global variable 정의 */
let abi_path = path.resolve(__dirname, 'abi', 'CrpMain.abi'); // abi가 저장된 file path
let data_path = path.resolve(__dirname, 'data', 'CrpMain.data'); // data를 저장할 file path
let abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
let Main = web3.eth.contract(JSON.parse(abi)); // get contract
let data = fs.readFileSync(data_path, 'utf-8'); // bytecode 추출

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
 * @author jhhong
 */
let MainDeploy = async () => {
    try {
        await web3.personal.unlockAccount(owner, passwd); // Unlock Account
        let data_with_params = Main.new.getData(title, {data: data}); // parameter까지 고려된 bytecode 추출
        let gas = web3.eth.estimateGas({from: owner, data: data_with_params}); // gas값 계산
        let contract = await Main.new(title, {from: owner, data: data, gas: gas}); // Main Deploy를 위한 tx 생성
        console.log('TX (Deploy Main Contract) Hash=[' + contract.transactionHash + ']');
        let receipt; // receipt object를 받을 변수
        do {
            receipt = await web3.eth.getTransactionReceipt(contract.transactionHash); // receipt 확인
            if(receipt) {
                console.log("Included in the Block=[" + web3.eth.blockNumber + "] CA=[" + receipt.contractAddress + "]!");
                console.log("Note! Current mca=[" + web3.eth.getMainContractAddress(owner) + "]");
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while(!receipt);
        await web3.personal.lockAccount(owner); // Lock Account
    } catch(err) {
        console.log(err);
    }
}
/**
 * 프로시져 수행 메인 함수이다. 
 * 
 * 1. clear screen
 * 2. MainDeploy
 * 
 * @author jhhong
 */
let RunProc = async () => {
    try {
        console.clear();
        /* 파라메터 체크 */
        console.log('* param1 (provider):...........' + args.provider);
        console.log('* param2 (web3 path):..........' + args.web3);
        console.log('* param3 (owner account):......' + args.owner);
        console.log('* param4 (owner password):.....' + args.password);
        console.log('* param5 (title):..............' + args.title);
        await MainDeploy();
    } catch(err) {}
}
RunProc();