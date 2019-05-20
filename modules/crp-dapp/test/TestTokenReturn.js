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
    console.log("    node TestTokenReturn.js [argv1] [argv2] [argv3] [argv4] [argv5] [argv6] [argv7]");
    console.log("....argv1: Crp Admin 계정 (Index)");
    console.log("....argv2: Crp Admin 암호");
    console.log("....argv3: 토큰 컨트랙트 주소");
    console.log("....argv4: 환수 처리할 계정");
    console.log("....argv5: 환수할 active 금액");
    console.log("....argv6: 환수할 pend 금액");
    console.log("....argv7: 환수할 guarantee 금액");
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
        if(process.argv.length != 9) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (Crp Admin Account Index):.....' + process.argv[2]);
        console.log('* Param02 (Crp Admin Password):..........' + process.argv[3]);
        console.log('* Param03 (CrpToken Address):............' + process.argv[4]);
        console.log('* Param04 (Account to return):...........' + process.argv[5]);
        console.log('* Param05 (Active Amount to return):.....' + process.argv[6]);
        console.log('* Param06 (Pending Amount to return).....' + process.argv[7]);
        console.log('* Param07 (Guarantee Amount to return)...' + process.argv[8]);
        const crpadmin = provider.web3.eth.accounts[process.argv[2]]; // owner account 주소
        const passwd = process.argv[3]; // owner 비번
        const tokenaddr = process.argv[4]; // 토큰 컨트랙트 주소
        const to = process.argv[5]; // Pend 수행할 계정
        const amount_active = process.argv[6]; // 환수할 엑티브 발란스
        const amount_pend = process.argv[7]; // 환수할 팬딩 발란스
        const amount_guarantee = process.argv[8]; // 환수할 게런티 발란스
        console.log('Crp Admin Account: [' + crpadmin + ']');
        let tokenobj = await api_token.getObject(tokenaddr);
        console.log("### Crp Admin [" + crpadmin + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(crpadmin).toString(10)));
        console.log("    To        [" + to + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(to).toString(10)));
        console.log("    To        [" + to + "]의 팬딩 발란스:   --> ", utils.getEther(tokenobj.pendingOf(to).toString(10)));
        console.log("    To        [" + to + "]의 게런티 발란스: --> ", utils.getEther(tokenobj.guaranteeOf(to).toString(10)));
        console.log("    토큰 활성화 상태 ==> ", tokenobj.enable());
        console.log("    계정 잠금 상태 [" + to + "] ==> ", tokenobj.locks(to));
        if(await act.tryActions(api_token.returnPurge, showProgress, false, 8, 
            true, crpadmin, passwd, tokenaddr, to, utils.getWei(amount_active), utils.getWei(amount_pend), utils.getWei(amount_guarantee)) == false) {
            throw new Error("Failed! (returnPurge)");
        }
        console.log("### Crp Admin [" + crpadmin + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(crpadmin).toString(10), "done!"));
        console.log("    To        [" + to + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(to).toString(10), "done!"));
        console.log("    To        [" + to + "]의 팬딩 발란스:   --> ", utils.getEther(tokenobj.pendingOf(to).toString(10), "done!"));
        console.log("    To        [" + to + "]의 게런티 발란스: --> ", utils.getEther(tokenobj.guaranteeOf(to).toString(10), "done!"));
    } catch(err) {
        console.log(err);
    }
}
RunProc();