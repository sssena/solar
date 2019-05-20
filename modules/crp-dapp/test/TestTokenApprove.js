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
    console.log("    node TestTokenApprove.js [argv1] [argv2] [argv3] [argv4] [argv5]");
    console.log("....argv1: 대리전송 권한을 부여할 계정 (Index)");
    console.log("....argv2: 계정의 암호");
    console.log("....argv3: 토큰 컨트랙트 주소");
    console.log("....argv4: 대리전송 권한을 부여받을 계정");
    console.log("....argv5: 대리전송 허가 금액");
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
        if(process.argv.length != 7) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (Owner Account Index):.......' + process.argv[2]);
        console.log('* Param02 (Owner Password):............' + process.argv[3]);
        console.log('* Param03 (CrpToken Address):..........' + process.argv[4]);
        console.log('* Param04 (Account to approve):........' + process.argv[5]);
        console.log('* Param05 (Approve Amount):............' + process.argv[6]);
        const owner = provider.web3.eth.accounts[process.argv[2]]; // owner account 주소
        const passwd = process.argv[3]; // owner 비번
        const tokenaddr = process.argv[4]; // 토큰 컨트랙트 주소
        const to = process.argv[5]; // 대리전송 권한 받을 계정
        const amount = process.argv[6]; // 대리전송 허용 금액
        console.log('Owner Account: [' + owner + ']');
        let tokenobj = await api_token.getObject(tokenaddr);
        console.log("### Allowance [" + owner + "][" + to + "]: --> ", utils.getEther(tokenobj.allowance(owner, to).toString(10)));
        if(await act.tryActions(api_token.approve, showProgress, false, 6, true, owner, passwd, tokenaddr, to, utils.getWei(amount)) == false) {
            throw new Error("Failed! (approve)");
        }
        console.log("### Allowance [" + owner + "][" + to + "]: --> ", utils.getEther(tokenobj.allowance(owner, to).toString(10)), "done!");
    } catch(err) {
        console.log(err);
    }
}
RunProc();