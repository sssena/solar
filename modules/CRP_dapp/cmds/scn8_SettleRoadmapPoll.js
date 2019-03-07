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
let data = fs.readFileSync(data_path, 'utf-8'); // bytecode 추출
let gas;
let receipt;

let main = web3.eth.contract(JSON.parse(abi)); // get contract
let token;
let road;
let fund;

let main_contract;
let token_contract;
let road_contract;
let fund_contract;

let main_address;
let token_address;
let road_address;
let fund_address;

let token_total_address_count;
let token_total_supply;
let token_total_agree_address;

let result_poll;



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

let GetTokenInfo = async () => {
    console.log('proceeding get token infomation ......');
    await milisleep(1000);
    main_address = await web3.eth.getMainContractAddress(owner);
    if (main_address == '0x0000000000000000000000000000000000000000') {
        throw new Error('The main contact created by [' + owner + '] does not exist.!');
    }
    main_contract = main.at(main_address);

    token_address = await main_contract.getTokenAddress({
        from: owner
    });
    abi_path = path.resolve(__dirname, 'abi', 'CrpToken.abi'); // abi가 저장된 file path
    data_path = path.resolve(__dirname, 'data', 'CrpToken.data'); // data를 저장할 file path
    abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
    token = web3.eth.contract(JSON.parse(abi));
    data = fs.readFileSync(data_path, 'utf-8'); // bytecode 추출
    token_contract = token.at(token_address);

    // token disable
    gas = await token_contract.setTokenDisable.estimateGas({
        from: owner
    });

    var availe_tx = await token_contract.setTokenDisable({
        from: owner,
        gas: gas
    });

    console.log('token disable TX Hash=[' + availe_tx + ']');
    do {
        receipt = await web3.eth.getTransactionReceipt(availe_tx); // receipt 확인
        if (receipt) {
            console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");
            break;
        }
        console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
        await milisleep(4000); // 4초 대기
    } while (!receipt);

    // get token infomation
    token_total_address_count = await token_contract.balance_count({
        from: owner
    });
    token_total_supply = await token_contract.totalSupply({
        from: owner
    });

    // at roadmap Contract
    abi_path = path.resolve(__dirname, 'abi', 'CrpPollRoadmap.abi'); // abi가 저장된 file path
    data_path = path.resolve(__dirname, 'data', 'CrpPollRoadmap.data'); // data를 저장할 file path
    abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
    road = web3.eth.contract(JSON.parse(abi)); // get contract
    data = fs.readFileSync(data_path, 'utf-8'); // bytecode 추출
    //test
    road_address = await main_contract.getRoadMapPollAddress(1, {
        from: owner
    });
    road_contract = road.at(road_address);

    // calculate vote weight
    var now_posit = await token_contract.balance_head({
        from: owner
    });
    var i;
    const calcul_tx = [];
    console.log('set roadmap voter weight .....')
    token_total_agree_address =0;
    for (i = 0; i < token_total_address_count; ++i) {
        var vote_info = await road_contract.getVoteInfo(now_posit, {
            from: owner
        });

        var token_balance = await token_contract.balanceOf(now_posit, {
            from: owner
        });
        if (vote_info[2]) {
            token_total_agree_address += token_balance;
        }
        gas = await road_contract.setAmount.estimateGas(now_posit, token_balance, {
            from: owner
        });
        calcul_tx[i] = await road_contract.setAmount(now_posit, token_balance, {
            from: owner,
            gas: gas
        });
        now_posit = vote_info[4];
        console.log('regist roamap weight by address : [' + i + '] ~ TX Hash=[' + calcul_tx[i] + ']');
    }

    for (i = 0; i < calcul_tx.length; ++i) {
        do {
            receipt = await web3.eth.getTransactionReceipt(calcul_tx[i]); // receipt 확인
            if (receipt) {
                console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);
    }
    //settle tx
    console.log('settle roadmap poll .....');
    gas = await road_contract.settlePoll.estimateGas(token_total_address_count, token_total_supply, Number(token_total_agree_address), {
        from: owner
    });
    var settle_tx = await road_contract.settlePoll(token_total_address_count, token_total_supply, Number(token_total_agree_address), {
        from: owner,
        gas: gas
    });
    console.log("settle_tx : " + settle_tx);
    do {
        receipt = await web3.eth.getTransactionReceipt(settle_tx); // receipt 확인
        if (receipt) {
            console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");
            break;
        }
        console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
        await milisleep(4000); // 4초 대기
    } while (!receipt);

    //fund contract at
    abi_path = path.resolve(__dirname, 'abi', 'CrpFund.abi'); // abi가 저장된 file path
    data_path = path.resolve(__dirname, 'data', 'CrpFund.data'); // data를 저장할 file path
    abi = fs.readFileSync(abi_path, 'utf-8'); // abi 추출
    fund = web3.eth.contract(JSON.parse(abi));

    fund_address = await main_contract.getFundAddress({
        from: owner
    });
    fund_contract = fund.at(fund_address);
}

let DeployNextRoadmap = async () => {
    console.log('deploy roadmap contract .....');
    let road_data;
    //test
    road_data = await main_contract.getRoadmapPollParams(2, {
        from: owner
    });
    if (road_data[2] != 0) {
        let data_with_params = road.new.getData(road_data[0], road_data[1], main_address, {
            data: data
        })
        gas = web3.eth.estimateGas({
            data: data_with_params
        });
        let road_contract = await road.new(road_data[0], road_data[1], main_address, {
            from: owner,
            data: data,
            gas: gas,
            mca: main_address
        })
        console.log('TX Hash=[' + road_contract.transactionHash + ']');
        do {
            receipt = await web3.eth.getTransactionReceipt(road_contract.transactionHash); // receipt 확인
            if (receipt) {
                console.log("Tx included! CA=[" + receipt.contractAddress + "]");
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);

        console.log('regist roadmap contract .....');
        let regist_road = await main_contract.addRoadMapPollAddress(receipt.contractAddress, {
            from: owner,
        });
        console.log('TX Hash=[' + regist_road + ']');
        do {
            receipt = await web3.eth.getTransactionReceipt(regist_road); // receipt 확인
            if (receipt) {
                console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);
    }else{
        console.log('change main contract stage to COMPLETED .....');
        gas = await main_contract.changeStage.estimateGas(5, {
            from: owner
        });
        let stage_tx = await main_contract.changeStage(5, {
            from: owner,
            gas: gas
        });
        do {
            receipt = await web3.eth.getTransactionReceipt(stage_tx); // receipt 확인
            if (receipt) {
                console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);
    }
}

let WinTransferCrp = async () => {
    console.log('transfer CRP to owner');
    //test
    let transfer_crp = await main_contract.getRoadmapPollParams(1, {
        from: owner
    });

    gas = await fund_contract.withdraw.estimateGas(owner, Number(transfer_crp[2]), {
        from: owner
    });

    let transfer_tx = await fund_contract.withdraw(owner, Number(transfer_crp[2]), {
        from: owner,
        gas: gas
    });
    console.log('transfer CRP, TX Hash=[' + transfer_tx + ']');
    do {
        var receipt = await web3.eth.getTransactionReceipt(transfer_tx); // receipt 확인
        if (receipt) {
            console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");
            break;
        }
        console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
        await milisleep(4000); // 4초 대기
    } while (!receipt);
}

let Refund = async () => {
    console.log('chage main contract stage to FAILED .....');
        gas = await main_contract.changeStage.estimateGas(4, {
            from: owner
        });
        let stage_tx = await main_contract.changeStage(4, {
            from: owner,
            gas: gas
        });
        do {
            receipt = await web3.eth.getTransactionReceipt(stage_tx); // receipt 확인
            if (receipt) {
                console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);

    console.log('refund CRP to holder..... ');
    var remain_crp = await fund_contract.showRemainFund({
        from: owner
    });
    var now_posit = await token_contract.balance_head({
        from: owner
    });
    const refund_tx = [];
    var i;
    for (i = 0; i < token_total_address_count; ++i) {
        console.log('test3 : ' + now_posit);
        var tmp_valance = await token_contract.balanceOf(now_posit, {
            from: owner
        });
        var refund_crp = (tmp_valance * remain_crp) / token_total_supply;
        gas = await fund_contract.withdraw.estimateGas(now_posit, refund_crp, {
            from: owner
        });
        refund_tx[i] = await fund_contract.withdraw(now_posit, refund_crp, {
            from: owner,
            gas: gas
        });
        now_posit = await token_contract.balances[now_posit].next({
            from: owner
        });
        console.log('test4 : ' + now_posit);
        console.log('refund CRP by address : [' + i + '] ~ TX Hash=[' + tx + ']');
    }
    for (i = 0; i < refund_tx.length; ++i) {
        do {
            let receipt = await web3.eth.getTransactionReceipt(refund_tx[i]); // receipt 확인
            if (receipt) {
                console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");
                break;
            }
            console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
            await milisleep(4000); // 4초 대기
        } while (!receipt);
    }
}

let enableToken = async () => {
    // token Enable
    gas = await token_contract.setTokenEnable.estimateGas({
        from: owner
    });

    var availe_tx = await token_contract.setTokenEnable({
        from: owner,
        gas: gas
    });
    console.log('token enable TX Hash=[' + availe_tx + ']');
    do {
        let receipt = await web3.eth.getTransactionReceipt(availe_tx); // receipt 확인
        if (receipt) {
            console.log("Included in the Block = [" +  receipt.blockNumber + "] HASH = [" +receipt.blockHash + "]!");
            break;
        }
        console.log("Wait for including Tx... Block=[" + web3.eth.blockNumber + "]");
        await milisleep(4000); // 4초 대기
    } while (!receipt);
}

let SettleRoadmapPoll = async () => {
    try {
        /* 파라메터 체크 */
        console.clear();
        console.log('* param1 (provider):.......' + init.provider);
        console.log('* param2 (web3 path):......' + init.web3);
        console.log('* param3 (owner account):..' + process.argv[2]);
        console.log('* param4 (owner password):.' + process.argv[3]);
        await web3.personal.unlockAccount(owner, passwd); // Unlock Account
        await GetTokenInfo();
        result_poll = await road_contract.result_poll({
            from: owner
        });
        if (result_poll) {            
            await DeployNextRoadmap();
            await WinTransferCrp();
            await enableToken();
        } else {
            await Refund();
        }        
        await web3.personal.unlockAccount(owner, passwd); // Unlock Account
    } catch (err) {
        console.log(err);
    }
}
SettleRoadmapPoll();