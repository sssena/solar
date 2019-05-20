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
    console.log("    node TestBatchDeploy.js [argv1] [argv2] [argv3] [argv4] [argv5]");
    console.log("....argv1: 토큰을 전송할 계정 (Index)");
    console.log("....argv2: 토큰을 전송할 계정의 암호");
    console.log("....argv3: 토큰 컨트랙트 주소");
    console.log("....argv4: 토큰을 받을 계정 (Index)");
    console.log("....argv5: 전송할 금액");
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
 * 진행상황 출력 함수이다.
 * 
 * @param _result 성공 / 실패
 * @param _curidx 현재 Tx 인덱스
 * @param _totalidx 총 Tx 인덱스
 * @param _count 시도 횟수
 * @author jhhong
 */
function showBatchDeploy(_result, _curidx, _totalidx, _count) {
    if(_result == true) {
        console.log("[" + (_curidx+1) + " / " + _totalidx + "] Tx...[" + _count + "]th trying...Success!");
    } else {
        console.log("[" + (_curidx+1) + " / " + _totalidx + "] Tx...[" + _count + "]th trying...Failed!");
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
        console.log('* Param01 (Sender Account Index):.......' + process.argv[2]);
        console.log('* Param02 (Sender Password):............' + process.argv[3]);
        console.log('* Param03 (CrpToken Address):...........' + process.argv[4]);
        console.log('* Param04 (Receiver Account Index):.....' + process.argv[5]);
        console.log('* Param05 (Receive Amount):.............' + process.argv[6]);
        const sender = provider.web3.eth.accounts[process.argv[2]]; // 전송자 account 주소
        const passwd = process.argv[3]; // 전송자 비번
        const tokenaddr = process.argv[4]; // 토큰 컨트랙트 주소
        const to = provider.web3.eth.accounts[process.argv[5]]; // 토큰 받을 계정
        const amount = process.argv[6]; // 토큰 양
        console.log("* 시나리오");
        console.log("--> 전송자 ["+sender+"]가 ["+to+"]에게 ["+amount+"]만큼 10회 송금");
        console.log("--> 생성된 TX들이 병렬적으로 블록에 정상 탑재되는지 확인");
        console.log("--> 모든 TX들이 블록에 정상 탑재된 후 프로그램이 정상 종료 되는지 확인");
        console.log('Sender Account: [' + sender + ']');
        let tokenobj = await api_token.getObject(tokenaddr);
        console.log("### Sender [" + sender + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(sender).toString(10)));
        console.log("    To     [" + to + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(to).toString(10)));
        for(let i = 0; i < 10; i++) {
            if(await act.tryActions(api_token.transfer, showProgress, false, 6, false, sender, passwd, tokenaddr, to, utils.getWei(amount)) == false) {
                throw new Error("Failed! (transfer)");
            }
        }
        await act.batchDeploy(showBatchDeploy, sender, passwd);
        console.log("### Sender [" + sender + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(sender).toString(10), "done!"));
        console.log("    To     [" + to + "]의 엑티브 발란스: --> ", utils.getEther(tokenobj.activeOf(to).toString(10), "done!"));
    } catch(err) {
        console.log(err);
    }
}
RunProc();