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
    console.log("    node TestMainSetStaffInfo.js [argv1] [argv2] [argv3] [argv4] [argv5]");
    console.log("....argv1: Owner 계정 (Index)");
    console.log("....argv2: Owner 암호");
    console.log("....argv3: 메인 컨트랙트 주소");
    console.log("....argv4: 스텝 계좌");
    console.log("....argv5: 스텝 지분율");
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
        console.log('* Param01 (Owner Account Index):....' + process.argv[2]);
        console.log('* Param02 (Owner Password):.........' + process.argv[3]);
        console.log('* Param03 (CrpMain Address):........' + process.argv[4]);
        console.log('* Param04 (Staff Address):..........' + process.argv[5]);
        console.log('* Param05 (Staff Ratio):............' + process.argv[6]);
        const owner = provider.web3.eth.accounts[process.argv[2]]; // owner account 주소
        const passwd = process.argv[3]; // owner 비번
        const mainaddr = process.argv[4]; // 메인 컨트랙트 주소
        const staffaddr = process.argv[5]; // 스텝 계정 주소
        const staffratio = process.argv[6]; // 스텝 지분율
        console.log('Owner Account: [' + owner + ']');
        if(await act.tryActions(api_main.setStaffInfo, showProgress, false, 6, true, owner, passwd, mainaddr, staffaddr, staffratio) == false) {
            throw new Error("Failed! (setStaffInfo)");
        }
        let mainobj = await api_main.getObject(mainaddr);
        let staff_info = mainobj.getStaffInfo(staffaddr);
        console.log("### 스텝 ["+ staffaddr + "]의 보유량 = [" + staff_info[3] + "]");
    } catch(err) {
        console.log(err);
    }
}
RunProc();