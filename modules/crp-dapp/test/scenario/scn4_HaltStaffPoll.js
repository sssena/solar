const fs = require('fs'); // For 시나리오 params
const path = require('path'); // For 시나리오 params
let provider = require("../../api/provider.js"); // For Get Main Contract Address
let act = require("../../api/api_action.js");
let api_deploy = require("../../api/api_deploy.js");
let api_main = require("../../api/api_main.js");
let ca_token;
let ca_fund;
let ca_salemain;

/**
 * 진행상황 출력 함수이다.
 * 
 * @param _result 성공 / 실패
 * @param _count 시도 횟수
 * @author jhhong
 */
function showProgress(_result, _count) {
    if(_result == true) {
        console.log("[" + _count + "]th trying...Success!");
    } else {
        console.log("[" + _count + "]th trying...Failed!");
    }
}

/**
 * 진행상황 출력 함수이다.
 * 
 * @param _result 성공 / 실패
 * @param _count 시도 횟수
 * @param _ca 컨트랙트 주소
 * @author jhhong
 */
function showProgressToken(_result, _count, _ca) {
    if(_result == true) {
        console.log("[" + _count + "]th trying...Success! CA = [" + _ca + "]");
        ca_token = _ca;
    } else {
        console.log("[" + _count + "]th trying...Failed!");
    }
}

/**
 * 진행상황 출력 함수이다.
 * 
 * @param _result 성공 / 실패
 * @param _count 시도 횟수
 * @param _ca 컨트랙트 주소
 * @author jhhong
 */
function showProgressFund(_result, _count, _ca) {
    if(_result == true) {
        console.log("[" + _count + "]th trying...Success! CA = [" + _ca + "]");
        ca_fund = _ca;
    } else {
        console.log("[" + _count + "]th trying...Failed!");
    }
}

/**
* 진행상황 출력 함수이다.
* 
* @param _result 성공 / 실패
* @param _count 시도 횟수
* @param _ca 컨트랙트 주소
* @author jhhong
*/
function showProgressSaleMain(_result, _count, _ca) {
   if(_result == true) {
       console.log("[" + _count + "]th trying...Success! CA = [" + _ca + "]");
       ca_salemain = _ca;
   } else {
       console.log("[" + _count + "]th trying...Failed!");
   }
}

/**
 * 진행상황 출력 함수이다.
 * 
 * @param _result 성공 / 실패
 * @param _curidx 현재 Tx 인덱스
 * @param _totalidx 총 Tx 인덱스
 * @param _count 시도 횟수
 * @author jhhong
 */
function showBatchDeploy(_result, _curidx, _totalidx, _count) {
    if(_result == true) {
        console.log("[" + (_curidx+1) + " / " + _totalidx + "] Tx...[" + _count + "]th trying...Success!");
    } else {
        console.log("[" + (_curidx+1) + " / " + _totalidx + "] Tx...[" + _count + "]th trying...Failed!");
    }
}

/**
 * 화면을 클리어한다.
 * 
 * @author jhhong
 */
function ClearScreen() {
    console.clear();
    console.log(".");
    console.log(".");
    console.log(".");
} 

/**
 * 프로시져 수행 메인 함수이다. 
 * 
 * @author jhhong
 */
let RunProc = async () => {
    try {
        ClearScreen();
        let args_dir = path.resolve(__dirname, 'args');
        let params = fs.readFileSync(args_dir + '/scn4.json');
        let args = JSON.parse(params);
        /* 파라메터 체크 */
        console.log('* Param01 (Owner Account):.............' + args.owner);
        console.log('* Param02 (Owner Password):............' + args.passwd);
        let owner = args.owner;
        let passwd = args.passwd;
        const mainaddr = await provider.web3.eth.getMainContractAddress(owner);
        console.log("MCA = [" + mainaddr + "]");
        if(await act.tryActions(api_main.haltPollStaff, showProgress, false, 4, true, owner, passwd, mainaddr) == false) {
            throw new Error("Failed! (haltPollStaff)");
        }
        let mainobj = await api_main.getObject(mainaddr);
        let state = mainobj.stage();
        console.log("HaltSale 후 메인 컨트랙트 State = [" + state + "]");
        if(state.toNumber() ==  1) {
            let token_info = mainobj.token_param();
            let name = token_info[0];
            let symbol = token_info[1];
            let st20 = token_info[2].toNumber(10);
            if(await act.tryActions(api_deploy.deployCrpToken, showProgressToken, true, 7, true, owner, passwd, name, symbol, st20, "0x526d8e4287eddddb4828104fb6bb384f6d7cda07") == false) {
                throw new Error("Failed! (deployCrpToken)");
            }
            console.log(">>> TOKEN CA = [" + ca_token + "]");
            if(await act.tryActions(api_deploy.deployCrpFund, showProgressFund, true, 3, true, owner, passwd) == false) {
                throw new Error("Failed! (deployCrpFund)");
            }
            console.log(">>> FUND CA = [" + ca_fund + "]");
            let sale_info = mainobj.sale_param();
            let starttm = sale_info[0].toNumber();
            let endtm = sale_info[1].toNumber();
            let softcap = sale_info[2].toNumber();
            let hardcap = sale_info[3].toNumber();
            let foudrate = sale_info[4].toNumber();
            let maxcrp = sale_info[5].toNumber();
            let mincrp = sale_info[6].toNumber();
            let ratio = sale_info[7].toNumber();
            let withdrawal = sale_info[8].toNumber();
            if(await act.tryActions(api_deploy.deployCrpSaleMain, showProgressSaleMain, true, 13, true, owner, passwd, starttm, endtm,
                softcap, hardcap, foudrate, maxcrp, mincrp, ratio, withdrawal, ca_fund) == false) {
                throw new Error("Failed! (deployCrpSaleMain)");
            }
            console.log(">>> SALEMAIN CA = [" + ca_salemain + "]");
            if(await act.tryActions(api_main.setTokenAddress, showProgress, false, 5, false, owner, passwd, mainaddr, ca_token) == false) {
                throw new Error("Failed! (setTokenAddress)");
            }
            if(await act.tryActions(api_main.setFundAddress, showProgress, false, 5, false, owner, passwd, mainaddr, ca_fund) == false) {
                throw new Error("Failed! (setFundAddress)");
            }
            if(await act.tryActions(api_main.addCrowdSaleAddress, showProgress, false, 5, false, owner, passwd, mainaddr, ca_salemain) == false) {
                throw new Error("Failed! (addCrowdSaleAddress)");
            }
            await act.batchDeploy(showBatchDeploy, owner, passwd);
        } else {
            console.log("Failed Staff Poll!!");
        }
    } catch(err) {
        console.log(err);
    }
}
RunProc();