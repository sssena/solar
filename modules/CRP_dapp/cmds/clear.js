const fs = require('fs'); // file-system
const path = require('path'); // path-package
let args_dir = path.resolve(__dirname, 'args'); // argument file이 위치한 directory path
let params = fs.readFileSync(args_dir + '/clear.json');
let args = JSON.parse(params);
const provider = args.provider; // http-based web3 provider
let web3_path = (args.web3 == 'null')? ('web3') :(args.web3); // crp-web3 path
const passwd = args.adminpass; // admin's password
let authorized = args.account; // the account to be authorized
/* web3 provider 설정 */
const Web3 = require(web3_path); // web3 api
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider)); // set provider

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

let clear = async() => {
    try{
        if(!web3.eth.isAccount(web3.eth.getAdminAddress())) { // local wallet에 admin 존재 여부 체크
            throw new Error('[' + web3.eth.getAdminAddress() + '] is not exist in the local wallet!');
        }
        let owner = web3.eth.getAdminAddress();
        await web3.personal.unlockAccount(authorized, passwd); // Unlock Account
        let receipt;
        let gas = web3.eth.estimateGas({from: owner}); 
        let tx = web3.eth.clearMainContractAddress(authorized, '0x000000000000000000000000000000000000000f', gas);
        do {
            receipt = await web3.eth.getTransactionReceipt(tx); // receipt 확인
            if(receipt) {
                console.log('Tx included! Status=[' + receipt.status + ']');
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while(!receipt);
        await web3.personal.lockAccount(authorized); // Lock Account
    } catch(err) {
        console.log(err);
    }
}
/**
 * 프로시져 수행 메인 함수이다. 
 * 
 * 1. clear screen
 * 2. Authorize
 * 
 * @author jhhong
 */
let RunProc = async () => {
    try {
        console.clear();
        /* 파라메터 체크 */
        console.log('* param1 (provider):...........' + args.provider);
        console.log('* param2 (web3 path):..........' + args.web3);
        console.log('* param3 (admin password):.....' + args.adminpass);
        console.log('* param4 (cleared account):.' + args.account);
        await clear();
    } catch(err) {}
}
RunProc();