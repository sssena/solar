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
    console.log("    node deploy_CrpMain.js [argv1] [argv2] [argv3] [argv4]");
    console.log("....argv1: Owner 계정 (Index)");
    console.log("....argv2: Owner 암호");
    console.log("....argv3: 프로젝트 타이틀 (string)");
    console.log("....argv4: Staff DB 컨트랙트 주소");
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
        if(process.argv.length != 6) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (Owner Account Index):..' + process.argv[2]);
        console.log('* Param02 (Owner Password):.......' + process.argv[3]);
        console.log('* Param03 (Project Title):........' + process.argv[4]);
        console.log('* Param04 (Staff DB addr):........' + process.argv[5]);
        const owner = provider.web3.eth.accounts[process.argv[2]];
        const passwd = process.argv[3];
        const title = process.argv[4];
        const staffdbca = process.argv[5];
        console.log('Owner Account: [' + owner + ']');
        if(await act.tryActions(api_deploy.clearMca, showProgress, false, 3, true, owner, passwd) == false) {
            throw new Error("Failed! (clearMca)");
        }
        if(await act.tryActions(api_deploy.deployCrpMain, showProgress, true, 5, true, owner, passwd, title, staffdbca) == false) {
            throw new Error("Failed! (deployCrpMain)");
        }
    } catch(err) {
        console.log(err);
    }
}
RunProc();