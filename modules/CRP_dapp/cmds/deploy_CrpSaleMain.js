const fs = require('fs'); // file-system
const path = require('path'); // path-package
let args_dir = path.resolve(__dirname, 'args'); // argument file이 위치한 directory path
let params = fs.readFileSync(args_dir + '/deploy_CrpSaleMain.json');
let args = JSON.parse(params);
const provider = args.provider; // http-based web3 provider
const owner = args.owner; // owner account
const passwd = args.password; // owner password
const start_sale = args.salestart; // 세일 시작시간(epoch time)
const end_sale = args.saleend; // 세일 끝시간(epoch time)
const softcap = args.softcap; // 최소 모금금액
const hardcap = args.hardcap; // 최대 모금금액
const found_rate = args.foundation; // 추가 토큰 발행 비율 (영화 제작진 보상용)
const max = args.maxcoin; // 한번에 구매할 수 있는 최대 세일 금액 (CRP)
const min = args.mincoin; // 한번에 구매할 수 있는 최소 세일 금액 (CRP)
const ratio = args.rate; // 토큰과 CRP-COIN 교환 비율 (COIN 하나당 토큰 몇 개)
const first_withdraw = args.withdraw; // 세일 성공 시 최초 인출되는 CRP-COIN
let web3_path = (args.web3 == 'null')? ('web3') :(args.web3);
/* web3 provider 설정 */
const Web3 = require(web3_path); // web3 api
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider)); // set provider
/* global variable 정의 */
let abi_path = path.resolve(__dirname, 'abi', 'CrpSaleMain.abi'); // abi가 저장된 file path
let data_path = path.resolve(__dirname, 'data', 'CrpSaleMain.data'); // data를 저장할 file path
let abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
let sale = web3.eth.contract(JSON.parse(abi)); // get contract
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
 * CrpSaleMain Contract deploy를 수행하는 함수이다. 아래의 절차에 따라 진행된다.
 * 1. unlock Account 수행
 * 2. sale.new 수행
 * 3. getTransactionReceipt를 통해, 발행된 tx가 블록에 실렸는지 확인
 * 4. lock Account 수행
 * 
 * @author jhhong
 */
let SaleDeploy = async () => {
    try {
        let main_addr = await web3.eth.getMainContractAddress(owner);
        if(main_addr == '0x0000000000000000000000000000000000000000') {
            throw new Error('The main contact created by [' + owner + '] does not exist.!');
        }
        await web3.personal.unlockAccount(owner, passwd); // Unlock Account
        let data_with_param = sale.new.getData(start_sale, end_sale, softcap, hardcap, 
            found_rate, max, min, ratio, first_withdraw, main_addr, {data: data}); // parameter까지 고려된 bytecode 추출
        let gas = web3.eth.estimateGas({data: data_with_param}); // gas값 계산
        let contract = await sale.new(start_sale, end_sale, softcap, hardcap, 
            found_rate, max, min, ratio, first_withdraw, main_addr, {from: owner, data: data, gas: gas, mca: main_addr}); // Sale Deploy를 위한 tx 생성
        console.log('TX (Deploy Sale Contract) Hash=[' + contract.transactionHash + ']');
        let receipt; // receipt object를 받을 변수
        do {
            receipt = await web3.eth.getTransactionReceipt(contract.transactionHash); // receipt 확인
            if(receipt) {
                console.log("Included in the Block=[" + web3.eth.blockNumber + "] CA=[" + receipt.contractAddress + "]!");
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
 * 2. SaleDeploy
 * 
 * @author jhhong
 */
let RunProc = async () => {
    try {
        console.clear();
        /* 파라메터 체크 */
        console.log('* param1  (provider):........' + args.provider);
        console.log('* param2  (web3 path):.......' + args.web3);
        console.log('* param3  (owner account):...' + args.owner);
        console.log('* param4  (owner password):..' + args.password);
        console.log('* param5  (sale start time):.' + args.salestart);
        console.log('* param6  (sale end time):...' + args.saleend);
        console.log('* param7  (softcap):.........' + args.softcap);
        console.log('* param8  (hardcap):.........' + args.hardcap);
        console.log('* param9  (foundation rate):.' + args.foundation);
        console.log('* param10 (max sale amount):.' + args.maxcoin);
        console.log('* param11 (min sale amount):.' + args.mincoin);
        console.log('* param12 (exchange rate):...' + args.rate);
        console.log('* param13 (inital withdraw):.' + args.withdraw);
        await SaleDeploy();
    } catch(err) {}
}
RunProc();