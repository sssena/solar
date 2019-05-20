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
    console.log("    node TestMainSetMainSaleParams.js [argv1] [argv2] [argv3] [argv4] [argv5] [argv6] [argv7] [argv8] [argv9] [argv10] [argv11] [argv12]");
    console.log("....argv01: Owner 계정 (Index)");
    console.log("....argv02: Owner 암호");
    console.log("....argv03: 메인 컨트랙트 주소");
    console.log("....argv04: 세일 시작 시각");
    console.log("....argv05: 세일 종료 시각");
    console.log("....argv06: Softcap");
    console.log("....argv07: Hardcap");
    console.log("....argv08: 추가 발행 비율");
    console.log("....argv09: MAX CRP");
    console.log("....argv10: MIN CRP");
    console.log("....argv11: 교환 비율");
    console.log("....argv12: 초기 인출 금액");
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
        if(process.argv.length != 14) {
            Usage();
            throw new Error("Invalid Argument!");
        }
        /* 파라메터 체크 */
        console.log('* Param01 (Owner Account Index):.......' + process.argv[2]);
        console.log('* Param02 (Owner Password):............' + process.argv[3]);
        console.log('* Param03 (CrpMain Address):...........' + process.argv[4]);
        console.log('* Param04 (Sale Start Time):...........' + process.argv[5]);
        console.log('* Param05 (Sale End Time):.............' + process.argv[6]);
        console.log('* Param06 (Softcap):...................' + process.argv[7]);
        console.log('* Param07 (Hardcap):...................' + process.argv[8]);
        console.log('* Param08 (Additional Issue Rate):.....' + process.argv[9]);
        console.log('* Param09 (Max CRP Coin):..............' + process.argv[10]);
        console.log('* Param10 (Min CRP Coin):..............' + process.argv[11]);
        console.log('* Param11 (Exchange Ratio):............' + process.argv[12]);
        console.log('* Param12 (Initial Withdraw Amount):...' + process.argv[13]);
        const owner = provider.web3.eth.accounts[process.argv[2]]; // owner account 주소
        const passwd = process.argv[3]; // owner 비번
        const mainaddr = process.argv[4]; // 메인 컨트랙트 주소
        const salestart = process.argv[5]; // 세일 시작 시각
        const saleend = process.argv[6]; // 세일 종료 시각
        const softcap = process.argv[7]; // Softcap
        const hardcap = process.argv[8]; // Hardcap
        const foundation = process.argv[9]; // 추가 발행 비율
        const maxcrp = process.argv[10]; // CRP 수취 max값
        const mincrp = process.argv[11]; // CRP 수취 min값
        const ratio = process.argv[12]; // 교환 비율
        const withdrawal = process.argv[13]; // 초기 인출 금액
        console.log('Owner Account: [' + owner + ']');
        if(await act.tryActions(api_main.setMainSaleParams, showProgress, false, 13, true, 
            owner, passwd, mainaddr, salestart, saleend, softcap, hardcap, foundation,
            maxcrp, mincrp, ratio, withdrawal) == false) {
            throw new Error("Failed! (setMainSaleParams)");
        }
        let mainobj = await api_main.getObject(mainaddr);
        let sale_info = mainobj.sale_param();
        console.log("### 세일 시작시각 ==>", sale_info[0].toString(10));
        console.log("    세일 종료시각 ==>", sale_info[1].toString(10));
        console.log("    Softcap ==>", sale_info[2].toString(10));
        console.log("    Hardcap ==>", sale_info[3].toString(10));
        console.log("    추가 발행비율 ==>", sale_info[4].toString(10));
        console.log("    MAX CRP ==>", sale_info[5].toString(10));
        console.log("    MIN CRP ==>", sale_info[6].toString(10));
        console.log("    교환 비율 ==>", sale_info[7].toString(10));
        console.log("    초기 인출금액 ==>", sale_info[8].toString(10));
    } catch(err) {
        console.log(err);
    }
}
RunProc();