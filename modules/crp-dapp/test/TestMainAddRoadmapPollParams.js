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
    console.log("    node TestMainAddRoadmapPollParam.js [argv1] [argv2] [argv3] [argv4] [argv5] [argv6]");
    console.log("....argv1: Owner 계정 (Index)");
    console.log("....argv2: Owner 암호");
    console.log("....argv3: 메인 컨트랙트 주소");
    console.log("....argv4: 로드맵 투표 시작 시각");
    console.log("....argv5: 로드맵 투표 종료 시각");
    console.log("....argv6: 인출될 CRP양");
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
        console.log('* Param04 (Roadmap Start Time):.....' + process.argv[5]);
        console.log('* Param05 (Roadmap End Time):.......' + process.argv[6]);
        console.log('* Param06 (Withdraw Amount):........' + process.argv[7]);
        const owner = provider.web3.eth.accounts[process.argv[2]]; // owner account 주소
        const passwd = process.argv[3]; // owner 비번
        const mainaddr = process.argv[4]; // 메인 컨트랙트 주소
        const starttime = process.argv[5]; // 로드맵 투표 시작 시각
        const endtime = process.argv[6]; // 로드맵 투표 종료 시각
        const withdrawal = process.argv[7]; // 투표 성공 시 인출 금액
        console.log('Owner Account: [' + owner + ']');
        if(await act.tryActions(api_main.addRoadmapPollParams, showProgress, false, 7, true, owner, passwd, mainaddr, starttime, endtime, withdrawal) == false) {
            throw new Error("Failed! (addRoadmapPollParams)");
        }
        let mainobj = await api_main.getObject(mainaddr);
        let roadmap_idx = mainobj.getRoadmapParamsNum();
        let roadmap_info = mainobj.roadmap_param(roadmap_idx - 1);
        console.log("### 투표 시작 시각 = ["+ roadmap_info[0].toString(10) + "]");
        console.log("    투표 종료 시각 = ["+ roadmap_info[1].toString(10) + "]");
        console.log("    인출 금액 = ["+ roadmap_info[2].toString(10) + "]");
    } catch(err) {
        console.log(err);
    }
}
RunProc();