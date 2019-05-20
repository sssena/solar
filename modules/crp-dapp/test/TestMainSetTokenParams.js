let provider = require("../api/provider.js"); // eth.accounts 얻어오기 위함
let act = require("../api/api_action.js");
let api_main = require("../api/api_main.js");

/**
 * Usage 출력 함수이다.
 * 
 * @author jhhong
 */
function Usage() {
    console.log("Usage --> ");
    console.log("    node TestMainSetTokenParams.js [argv1] [argv2] [argv3] [argv4] [argv5] [argv6]");
    console.log("....argv1: Owner 계정 (Index)");
    console.log("....argv2: Owner 암호");
    console.log("....argv3: 메인 컨트랙트 주소");
    console.log("....argv4: 토큰 이름");
    console.log("....argv5: 토큰 심볼");
    console.log("....argv6: ST20 사용 여부");
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
        if(process.argv.length != 8) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (Owner Account Index):....' + process.argv[2]);
        console.log('* Param02 (Owner Password):.........' + process.argv[3]);
        console.log('* Param03 (CrpMain Address):........' + process.argv[4]);
        console.log('* Param04 (Token Name):.............' + process.argv[5]);
        console.log('* Param05 (Token Symbol):...........' + process.argv[6]);
        console.log('* Param06 (ST20 flag):..............' + process.argv[7]);
        const owner = provider.web3.eth.accounts[process.argv[2]]; // owner account 주소
        const passwd = process.argv[3]; // owner 비번
        const mainaddr = process.argv[4]; // 메인 컨트랙트 주소
        const name = process.argv[5]; // 토큰 이름
        const symbol = process.argv[6]; // 토큰 심볼
        const sto = process.argv[7]; // ST20 사용 여부
        console.log('Owner Account: [' + owner + ']');
        if(await act.tryActions(api_main.setTokenParams, showProgress, false, 7, true, owner, passwd, mainaddr, name, symbol, sto) == false) {
            throw new Error("Failed! (setTokenParams)");
        }
        let mainobj = await api_main.getObject(mainaddr);
        let token_info = mainobj.token_param();
        console.log("### 토큰 이름 ==>", token_info[0]);
        console.log("    토큰 심볼 ==>", token_info[1]);
        console.log("    ST20 사용여부 ==>", token_info[2].toNumber(10));
    } catch(err) {
        console.log(err);
    }
}
RunProc();