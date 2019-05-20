let provider = require("../api/provider.js"); // eth.accounts 얻어오기 위함
let act = require("../api/api_action.js");
let api_deploy = require("../api/api_deploy.js");

/**
 * Usage 출력 함수이다.
 * 
 * @author jhhong
 */
function Usage() {
    console.log("Usage --> ");
    console.log("    node deploy_CrpSaleMain.js [argv1] [argv2] [argv3] [argv4] [argv5] [argv6] [argv7] [argv8] [argv9] [argv10] [argv11]");
    console.log("....argv1:  Owner 계정 (Index)");
    console.log("....argv2:  Owner 암호");
    console.log("....argv3:  세일 시작 시각");
    console.log("....argv4:  세일 종료 시각");
    console.log("....argv5:  Softcap");
    console.log("....argv6:  Hardcap");
    console.log("....argv7:  추가 발행 비율");
    console.log("....argv8:  최대 수취 금액 (CRP)");
    console.log("....argv9:  최소 수취 금액 (CRP)");
    console.log("....argv10: 교환 비율");
    console.log("....argv11: 초기 인출 금액");
    console.log("....argv12: 펀드 컨트랙트 주소");
}

/**
 * 진행상황 출력 함수이다.
 * 
 * @param _result 성공 / 실패
 * @param _count 시도 횟수
 * @param _ca 컨트랙트 주소
 * @author jhhong
 */
function showProgress(_result, _count, _ca) {
    if(_result == true) {
        console.log("[" + _count + "]th trying...Success! CA = [" + _ca + "]");
    } else {
        console.log("[" + _count + "]th trying...Failed!");
    }
}

/**
 * 프로시져 수행 메인 함수이다. 
 * 
 * @author jhhong
 */
let RunProc = async () => {
    try {
        console.clear();
        if(process.argv.length != 14) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (Owner Account Index):....' + process.argv[2]);
        console.log('* Param02 (Owner Password):.........' + process.argv[3]);
        console.log('* Param03 (Sale Start):.............' + process.argv[4]);
        console.log('* Param04 (Sale End):...............' + process.argv[5]);
        console.log('* Param05 (Softcap):................' + process.argv[6]);
        console.log('* Param06 (Hardcap):................' + process.argv[7]);
        console.log('* Param07 (Found Rate):.............' + process.argv[8]);
        console.log('* Param08 (Max CRP):................' + process.argv[9]);
        console.log('* Param09 (Min CRP):................' + process.argv[10]);
        console.log('* Param10 (Ratio):..................' + process.argv[11]);
        console.log('* Param11 (Withdrawal):.............' + process.argv[12]);
        console.log('* Param12 (Fund CA):................' + process.argv[13]);
        const owner = provider.web3.eth.accounts[process.argv[2]];
        const passwd = process.argv[3];
        const starttm = process.argv[4];
        const endtm = process.argv[5];
        const softcap = process.argv[6];
        const hardcap = process.argv[7];
        const foudrate = process.argv[8];
        const maxcrp = process.argv[9];
        const mincrp = process.argv[10];
        const ratio = process.argv[11];
        const withdrawal = process.argv[12];
        const fundaddr = process.argv[13];
        console.log('Owner Account: [' + owner + ']');
        if(await act.tryActions(api_deploy.deployCrpSaleMain, showProgress, true, 13, true, owner, passwd, starttm, endtm,
            softcap, hardcap, foudrate, maxcrp, mincrp, ratio, withdrawal, fundaddr) == false) {
            throw new Error("Failed! (deployCrpSaleMain)");
        }
    } catch(err) {
        console.log(err);
    }
}
RunProc();