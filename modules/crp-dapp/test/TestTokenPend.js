let provider = require("../api/provider.js"); // eth.accounts 얻어오기 위함
let utils = require("../api/utils.js"); // utils 함수를 사용하기 위함
let act = require("../api/api_action.js");
let api_token = require("../api/api_token.js");

/**
 * Usage 출력 함수이다.
 * 
 * @author jhhong
 */
function Usage() {
    console.log("Usage --> ");
    console.log("    node TestTokenPend.js [argv1] [argv2] [argv3] [argv4] [argv5] [argv6]");
    console.log("....argv1: owner 계정 (Index)");
    console.log("....argv2: owner 암호");
    console.log("....argv3: 토큰 컨트랙트 주소");
    console.log("....argv4: pend 처리할 계정");
    console.log("....argv5: active 금액 비율 (%)");
    console.log("....argv6: pend 풀릴 시각 (epoch time)");
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
        console.log('* Param01 (Owner Account Index):.......' + process.argv[2]);
        console.log('* Param02 (Owner Password):............' + process.argv[3]);
        console.log('* Param03 (CrpToken Address):..........' + process.argv[4]);
        console.log('* Param04 (Account to Pend):...........' + process.argv[5]);
        console.log('* Param05 (Pend Ratio):................' + process.argv[6]);
        console.log('* Param06 (Pend Time):.................' + process.argv[7]);
        const owner = provider.web3.eth.accounts[process.argv[2]]; // owner account 주소
        const passwd = process.argv[3]; // owner 비번
        const tokenaddr = process.argv[4]; // 토큰 컨트랙트 주소
        const to = process.argv[5]; // Pend 수행할 계정
        const ratio = process.argv[6]; // 엑티브 발란스 비율
        const pendtime = process.argv[7]; // Pend Time
        console.log('Owner Account: [' + owner + ']');
        let tokenobj = await api_token.getObject(tokenaddr);
        console.log("### To [" + to + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(to).toString(10)));
        console.log("    To [" + to + "]의 팬딩 발란스: --> ", utils.getEther(tokenobj.pendingOf(to).toString(10)));
        console.log("    토큰 활성화 상태 ==> ", tokenobj.enable());
        console.log("    계정 잠금 상태 [" + to + "] ==> ", tokenobj.locks(to));
        if(await act.tryActions(api_token.pend, showProgress, false, 7, true, owner, passwd, tokenaddr, to, ratio, pendtime) == false) {
            throw new Error("Failed! (pend)");
        }
        console.log("### To [" + to + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(to).toString(10), "done!"));
        console.log("    To [" + to + "]의 팬딩 발란스: --> ", utils.getEther(tokenobj.pendingOf(to).toString(10), "done!"));
    } catch(err) {
        console.log(err);
    }
}
RunProc();