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
    console.log("    node deploy_CrpToken.js [argv1] [argv2] [argv3] [argv4] [argv5] [argv6]");
    console.log("....argv1: Owner 계정 (Index)");
    console.log("....argv2: Owner 암호");
    console.log("....argv3: 토큰 이름");
    console.log("....argv4: 토큰 심볼");
    console.log("....argv5: 토큰 타입[1:ST20, 0:ERC20]");
    console.log("....argv6: Token-DB 컨트랙트 주소");
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
        if(process.argv.length != 8) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (Owner Account Index):..........' + process.argv[2]);
        console.log('* Param02 (Owner Password):...............' + process.argv[3]);
        console.log('* Param03 (Token Name):...................' + process.argv[4]);
        console.log('* Param04 (Token Symbol):.................' + process.argv[5]);
        console.log('* Param05 (Token Type[1:ST20, 0:ERC20]):..' + process.argv[6]);
        console.log('* Param06 (Token DB CA):..................' + process.argv[7]);
        const owner = provider.web3.eth.accounts[process.argv[2]];
        const passwd = process.argv[3];
        const name = process.argv[4];
        const symbol = process.argv[5];
        const type = process.argv[6];
        const tokendbca = process.argv[7];
        console.log('Owner Account: [' + owner + ']');
        if(await act.tryActions(api_deploy.deployCrpToken, showProgress, true, 7, true, owner, passwd, name, symbol, type, tokendbca) == false) {
            throw new Error("Failed! (deployCrpToken)");
        }
    } catch(err) {
        console.log(err);
    }
}
RunProc();