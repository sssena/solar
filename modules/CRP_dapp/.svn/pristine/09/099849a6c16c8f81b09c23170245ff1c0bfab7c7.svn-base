const fs = require('fs'); // file-system
const path = require('path'); // path-package
let args_dir = path.resolve(__dirname, 'args');
let init_params = fs.readFileSync(args_dir + '/init.json', 'utf8');
let init = JSON.parse(init_params);
const provider = init.provider;
const owner = process.argv[2];
const passwd = process.argv[3];
let web3_path = (init.web3 == 'null') ? ('web3') : (init.web3);
/* web3 provider 설정 */
const Web3 = require(web3_path); // web3 api
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(provider)); // set provider
/* deploy에 필요한 요소들 추출 (abi, data, gas) */

let abi_path = path.resolve(__dirname, 'abi', 'CrpMain.abi'); // abi가 저장된 file path
let data_path = path.resolve(__dirname, 'data', 'CrpMain.data'); // data를 저장할 file path
let abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
let Main = web3.eth.contract(JSON.parse(abi)); // get contract
let contract;
let main_address;
let data = fs.readFileSync(data_path, 'utf-8'); // bytecode 추출
let gas;
let result_bool;
const contracts = [];
const contracts_addr = [];

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
 * @author sykang
 */
let HaltStaffPoll = async () => {
    try {
        console.log('proceeding HaltPollStaff .....');
        await milisleep(1000);
        await web3.personal.unlockAccount(owner, passwd); // Unlock Account
        main_address = await web3.eth.getMainContractAddress(owner);
        if (main_address == '0x0000000000000000000000000000000000000000') {
            throw new Error('The main contact created by [' + owner + '] does not exist.!');
        }
        contract = Main.at(main_address);
        let receipt; // receipt object를 받을 변수        
        gas = await contract.haltPollStaff.estimateGas({
            from: owner
        });
        let tx = await contract.haltPollStaff({
            from: owner,
            gas: gas
        });
        console.log('TX Hash=[' + tx + ']');
        do {
            receipt = await web3.eth.getTransactionReceipt(tx); // receipt 확인
            if (receipt) {
                console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);

        result_bool = await contract.stage({
            from: owner
        }).toNumber();
    } catch (err) {
        console.log(err);
    }
}

let DeployContracts = async () => {
    try {
        //deploy token
        console.log('proceeding DeployContracts .....');
        abi_path = path.resolve(__dirname, 'abi', 'CrpToken.abi'); // abi가 저장된 file path
        data_path = path.resolve(__dirname, 'data', 'CrpToken.data'); // data를 저장할 file path
        abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
        let token = web3.eth.contract(JSON.parse(abi));
        data = fs.readFileSync(data_path, 'utf-8'); // bytecode 추출
        let data_with_params;

        let token_info = await contract.getTokenParams({ //토큰 파람 얻기
            from: owner
        });
    
        data_with_params = token.new.getData(token_info[0], token_info[1], main_address, {
            data: data
        });

        gas = web3.eth.estimateGas({
            data: data_with_params
        });
        console.log('deploy token contract .....');
        let new_contract = await token.new(token_info[0], token_info[1], main_address, {
            from: owner,
            data: data,
            gas: gas,
            mca: main_address
        })
        contracts.push(new_contract);
        console.log('Deploy Token TX Hash=[' + contracts[0].transactionHash + ']');

        //deploy fund
        abi_path = path.resolve(__dirname, 'abi', 'CrpFund.abi'); // abi가 저장된 file path
        data_path = path.resolve(__dirname, 'data', 'CrpFund.data'); // data를 저장할 file path
        abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
        let Fund = web3.eth.contract(JSON.parse(abi)); // get contract
        data = fs.readFileSync(data_path, 'utf-8'); // bytecode 추출

        data_with_params = Fund.new.getData(main_address, {
            data: data
        });
        gas = web3.eth.estimateGas({
            data: data_with_params
        });
        console.log('deploy Fund contract .....');
        new_contract = await Fund.new(main_address, {
            data: data,
            from: owner,
            gas: gas,
            mca: main_address
        });
        contracts.push(new_contract) // Fund Deploy를 위한 tx 생성
        console.log('Deploy Fund TX Hash=[' + contracts[1].transactionHash + ']');

        let i;
        let receipt;
        for (i = 0; i < contracts.length; ++i) {
            do {
                receipt = await web3.eth.getTransactionReceipt(contracts[i].transactionHash); // receipt 확인
                if (receipt) {
                    contracts_addr.push(receipt.contractAddress);
                    console.log("Included in the Block=[" + web3.eth.blockNumber + "] CA=[" + receipt.contractAddress + "]!");
                    break;
                }
                console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
                await milisleep(4000); // 4초 대기

            } while (!receipt);
        }

        //deploy sale
        abi_path = path.resolve(__dirname, 'abi', 'CrpSaleMain.abi'); // abi가 저장된 file path
        data_path = path.resolve(__dirname, 'data', 'CrpSaleMain.data'); // data를 저장할 file path
        abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
        let sale = web3.eth.contract(JSON.parse(abi)); // get contract
        data = fs.readFileSync(data_path, 'utf-8'); // bytecode 추출

        let sale_info = await contract.getMainSaleParams({
            from: owner
        });

        data_with_param = sale.new.getData(sale_info[0].toNumber(), sale_info[1].toNumber(), sale_info[2].toNumber(), sale_info[3].toNumber(),
            sale_info[4].toNumber(), sale_info[5].toNumber(), sale_info[6].toNumber(), sale_info[7].toNumber(), sale_info[8].toNumber(), main_address, contracts_addr[1], {
                data: data
            });
        gas = web3.eth.estimateGas({
            data: data_with_param
        }); // gas값 계산
        console.log('deploy crow sale contract .....');
        new_contract = await sale.new(sale_info[0].toNumber(), sale_info[1].toNumber(), sale_info[2].toNumber(), sale_info[3].toNumber(),
            sale_info[4].toNumber(), sale_info[5].toNumber(), sale_info[6].toNumber(), sale_info[7].toNumber(), sale_info[8].toNumber(), main_address, contracts_addr[1], {
                from: owner,
                data: data,
                gas: gas,
                mca: main_address
            }); // Sale Deploy를 위한 tx 생성
        contracts.push(new_contract)
        console.log('Deploy sale TX Hash=[' + contracts[2].transactionHash + ']');       

        do {
            receipt = await web3.eth.getTransactionReceipt(contracts[2].transactionHash); // receipt 확인
            if (receipt) {
                contracts_addr.push(receipt.contractAddress);
                console.log("Included in the Block=[" + web3.eth.blockNumber + "] CA=[" + receipt.contractAddress + "]!");
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);  

    } catch (err) {

        console.log(err);
    }
}

let RegistContracts = async () => {
    try {
        console.log("regist contracts in CrpMain contract .....");
        //regsit token address in CrpMain.sol
        const regist_contract = [];
        console.log(contracts_addr[0]);
        gas = await contract.setTokenAddress.estimateGas(contracts_addr[0], {
            from: owner
        });

        new_tx = await contract.setTokenAddress(contracts_addr[0], {
            from: owner,
            gas: gas
        });
        regist_contract.push(new_tx);
        console.log('Regist Token CA = [' + contracts_addr[0] + ']');

        //regsit fund address in CrpMain.sol
        gas = await contract.setFundAddress.estimateGas(contracts_addr[1], {
            from: owner
        });
        new_tx = await contract.setFundAddress(contracts_addr[1], {
            from: owner,
            gas: gas
        });
        regist_contract.push(new_tx);
        console.log('Regist Fund CA = [' + contracts_addr[1] + ']');

        //regsit sale address in CrpMain.sol
        gas = await contract.addCrowdSaleAddress.estimateGas(contracts_addr[2], {
            from: owner
        });
        new_tx = await contract.addCrowdSaleAddress(contracts_addr[2], {
            from: owner,
            gas: gas
        });
        regist_contract.push(new_tx);
        console.log('Regist sale CA = [' + contracts_addr[2] + ']');

        // check that tx in block
        var i;
        let receipt;
        for (i = 0; i < regist_contract.length; i++) {
            do {
                receipt = await web3.eth.getTransactionReceipt(regist_contract[i]); // receipt 확인
                if (receipt) {
                    console.log("Tx=[" + regist_contract[i] + "] Included in the Block=[" + receipt.blockNumber + "]!")
                    break;
                }
                console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
                await milisleep(4000); // 4초 대기
            } while (!receipt);
        }
        console.log('----- chage main contract stage to SAILING');
        gas = await contract.changeStage.estimateGas(2, {
            from: owner
        });
        let stage_tx = await contract.changeStage(2, {
            from: owner,
            gas: gas
        });
        console.log('change Stage TX Hash=[' + stage_tx + ']'); 
        do {
            receipt = await web3.eth.getTransactionReceipt(stage_tx); // receipt 확인
            if (receipt) {
                console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);

    } catch (err) {
        console.log(err);
    }

}
/**
 * 스탭 투표 마감 이후 수행 시나리오에 맞게 각 과정을 수행하는 함수이다. 
 * 
 * 1. HaltStaffPoll 수행
 * 2. result_boll에 따라서 결과 실행
 * 행
 * @author sykang
 */
let RunProc = async () => {
    try {
        console.clear();
        /* 파라메터 체크 */
        console.log('* param1 (provider):.......' + init.provider);
        console.log('* param2 (web3 path):......' + init.web3);
        console.log('* param3 (owner account):..' + process.argv[2]);
        console.log('* param4 (owner password):.' + process.argv[3]);
        await HaltStaffPoll();
        if (result_bool == 1) {
            console.log('* staff poll result is sucess');
            await DeployContracts();
            await RegistContracts();
        } else {
            console.log('* staff poll result is rejection');
        }
    } catch(err) {}
}
RunProc();