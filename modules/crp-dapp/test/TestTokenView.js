let provider = require("../api/provider.js"); // eth.accounts 얻어오기 위함
let utils = require("../api/utils.js"); // utils 함수를 사용하기 위함
let api_token = require("../api/api_token.js");

/**
 * Usage 출력 함수이다.
 * 
 * @author jhhong
 */
function Usage() {
    console.log("Usage --> ");
    console.log("    node TestTokenView.js [argv1] [argv2]");
    console.log("....argv1: 토큰 컨트랙트 주소");
    console.log("....argv2: 확인하고자 하는 계정 인덱스");
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
        if(process.argv.length != 4) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (CrpToken Address):..........' + process.argv[2]);
        console.log('* Param02 (Account to view (Index)):...' + process.argv[3]);
        const tokenaddr = process.argv[2]; // 토큰 컨트랙트 주소
        const user = provider.web3.eth.accounts[process.argv[3]]; // user account 주소
        console.log('User Account: [' + user + ']');
        let tokenobj = await api_token.getObject(tokenaddr);
        console.log("### 총 통화량 ==> [" + utils.getEther(tokenobj.totalSupply().toString(10)) + "]");
        console.log("### 토큰 활성화 여부 ==> [" + tokenobj.enable() + "]");
        console.log("### [" + user + "] 엑티브 토큰 보유량 ==> [" + utils.getEther(tokenobj.activeOf(user).toString(10)) + "]");
        console.log("### [" + user + "] 팬딩 토큰 보유량 ==> [" + utils.getEther(tokenobj.pendingOf(user).toString(10)) + "]");
        console.log("### [" + user + "] 게런티 토큰 보유량 ==> [" + utils.getEther(tokenobj.guaranteeOf(user).toString(10)) + "]");
        console.log("### [" + user + "] 관리자 권한 상태 ==> [" + tokenobj.admins(user) + "]");
        console.log("### [" + user + "] 계정 잠금 상태 ==> [" + tokenobj.locks(user) + "]");
    } catch(err) {
        console.log(err);
    }
}
RunProc();