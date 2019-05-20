let provider = require("../api/provider.js"); // eth.accounts 얻어오기 위함
let act = require("../api/api_action.js");
let api_auth = require("../api/api_auth.js");

/**
 * Usage 출력 함수이다.
 * 
 * @author jhhong
 */
function Usage() {
    console.log("Usage --> ");
    console.log("    node deploy_CrpMain.js [argv1] [argv2] [argv3]");
    console.log("....argv1: Crp Admin 계정 (Index)");
    console.log("....argv2: Crp Admin 암호");
    console.log("....argv3: 권한 할당 받을 Account");
}

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
        if(process.argv.length != 5) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (Crp Admin Account Index):....' + process.argv[2]);
        console.log('* Param02 (Crp Admin Password):.........' + process.argv[3]);
        console.log('* Param03 (Account to be authorized):...' + process.argv[4]);
        const admin = provider.web3.eth.accounts[process.argv[2]];
        const passwd = process.argv[3];
        const authorized = process.argv[4];
        console.log('Crp Admin Account: [' + admin + ']');
        if(await act.tryActions(api_auth.authorize, showProgress, false, 4, true, admin, passwd, authorized) == false) {
            throw new Error("Failed! (authorize)");
        }
    } catch(err) {
        console.log(err);
    }
}
RunProc();