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
    console.log("    node TestMainCancelStaffPoll.js [argv1] [argv2] [argv3]");
    console.log("....argv1: Voter 계정 (Index)");
    console.log("....argv2: Voter 암호");
    console.log("....argv3: 메인 컨트랙트 주소");
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
        console.log('* Param01 (Voter Account Index):....' + process.argv[2]);
        console.log('* Param02 (Voter Password):.........' + process.argv[3]);
        console.log('* Param03 (CrpMain Address):........' + process.argv[4]);
        const voter = provider.web3.eth.accounts[process.argv[2]]; // Voter account 주소
        const passwd = process.argv[3]; // Voter 비번
        const mainaddr = process.argv[4]; // 메인 컨트랙트 주소
        console.log('Voter Account: [' + voter + ']');
        if(await act.tryActions(api_main.cancelPollStaff, showProgress, false, 4, true, voter, passwd, mainaddr) == false) {
            throw new Error("Failed! (cancelPollStaff)");
        }
        let mainobj = await api_main.getObject(mainaddr);
        let staff_info = mainobj.getStaffInfo(voter);
        console.log("### 투표 시각 ==> ", staff_info[2].toString(10));
        console.log("    토큰 보유량 ==> ", staff_info[3].toString(10));
        console.log("    투표 값 ==> ", staff_info[4]);
    } catch(err) {
        console.log(err);
    }
}
RunProc();