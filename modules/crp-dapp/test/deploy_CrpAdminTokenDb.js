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
    console.log("    node deploy_CrpAdminStaffDb.js [argv1] [argv2]");
    console.log("....argv1: CrpAdmin 계정 (Index)");
    console.log("....argv2: CrpAdmin 암호");
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
        if(process.argv.length != 4) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (CrpAdmin Account Index):.......' + process.argv[2]);
        console.log('* Param02 (CrpAdmin Password):............' + process.argv[3]);
        const owner = provider.web3.eth.accounts[process.argv[2]];
        const passwd = process.argv[3];
        console.log('CrpAdmin Account: [' + owner + ']');
        if(await act.tryActions(api_deploy.deployCrpAdminTokenDb, showProgress, true, 3, true, owner, passwd) == false) {
            throw new Error("Failed! (deployCrpAdminTokenDb)");
        }
    } catch(err) {
        console.log(err);
    }
}
RunProc();