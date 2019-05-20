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
    console.log("    node TestTokenIssue.js [argv1] [argv2] [argv3] [argv4] [argv5] [argv6]");
    console.log("....argv1: Owner 계정 (Index)");
    console.log("....argv2: Owner 계정의 암호");
    console.log("....argv3: 토큰 컨트랙트 주소");
    console.log("....argv4: 발행한 토큰을 받을 계정");
    console.log("....argv5: 발행한 토큰 양");
    console.log("....argv6: 프리미엄 발행 (기존 토큰보유자에게만 발행) 여부 (0: 사용안함, 1: 사용함)");
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
        console.log('* Param01 (Owner Account Index):......' + process.argv[2]);
        console.log('* Param02 (Owner Password):...........' + process.argv[3]);
        console.log('* Param03 (CrpToken Address):.........' + process.argv[4]);
        console.log('* Param04 (Account to Issue):.........' + process.argv[5]);
        console.log('* Param05 (Issue Amount):.............' + process.argv[6]);
        console.log('* Param06 (whether premium or not):...' + process.argv[7]);
        const owner = provider.web3.eth.accounts[process.argv[2]]; // owner account 주소
        const passwd = process.argv[3]; // owner 비번
        const tokenaddr = process.argv[4]; // 토큰 컨트랙트 주소
        const to = process.argv[5]; // 발행한 토큰을 받을 계정
        const amount = process.argv[6]; // 토큰 발행양
        const premium = process.argv[7]; // 프리미엄 여부
        console.log('Owner Account: [' + owner + ']');
        let tokenobj = await api_token.getObject(tokenaddr);
        console.log("### [" + to + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(to).toString(10)));
        console.log("    총 통화량: --> ", utils.getEther(tokenobj.totalSupply().toString(10)));
        if(await act.tryActions(api_token.issue, showProgress, false, 8, true, owner, passwd, tokenaddr, to, utils.getWei(amount), premium, 1) == false) {
            throw new Error("Failed! (issue)");
        }
        console.log("### [" + to + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(to).toString(10), "done!"));
        console.log("    총 통화량: --> ", utils.getEther(tokenobj.totalSupply().toString(10), "done!"));
    } catch(err) {
        console.log(err);
    }
}
RunProc();