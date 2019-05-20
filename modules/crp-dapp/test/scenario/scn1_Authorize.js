const fs = require('fs'); // For 시나리오 params
const path = require('path'); // For 시나리오 params
let act = require("../../api/api_action.js");
let api_auth = require("../../api/api_auth.js");

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
        let args_dir = path.resolve(__dirname, 'args');
        let params = fs.readFileSync(args_dir + '/scn1.json');
        let args = JSON.parse(params);
        /* 파라메터 체크 */
        console.log('* Param01 (Crp Admin Account):..........' + args.crpadmin);
        console.log('* Param02 (Crp Admin Password):.........' + args.crpadminpass);
        console.log('* Param03 (Account to be authorized):...' + args.account);
        const admin = args.crpadmin;
        const passwd = args.crpadminpass;
        const authorized = args.account;
        if(await act.tryActions(api_auth.authorize, showProgress, false, 4, true, admin, passwd, authorized) == false) {
            throw new Error("Failed! (authorize)");
        }
    } catch(err) {
        console.log(err);
    }
}
RunProc();