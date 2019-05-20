const fs = require('fs'); // For 시나리오 params
const path = require('path'); // For 시나리오 params
let provider = require("../../api/provider.js"); // For Get Main Contract Address
let act = require("../../api/api_action.js");
let api_main = require("../../api/api_main.js");

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
        let args_dir = path.resolve(__dirname, 'args');
        let params = fs.readFileSync(args_dir + '/scn3.json');
        let args = JSON.parse(params);
        /* 파라메터 체크 */
        console.log('* Param01 (Owner address):.........' + args.owner);
        console.log('* Param02 (Owner passwd):.........' + args.passwd);
        const mainaddr = await provider.web3.eth.getMainContractAddress(args.owner);
        console.log("MCA = [" + mainaddr + "]");
        console.log('* Param03 (Staff1 address):.........' + args.staff1addr);
        console.log('* Param04 (Staff1 password):........' + args.staff1pass);
        console.log('* Param05 (Staff1 Val):.............' + args.staff1val);
        if(await act.tryActions(api_main.runPollStaff, showProgress, false, 5, false, args.staff1addr, args.staff1pass, mainaddr, args.staff1val) == false) {
            throw new Error("Failed! (runPollStaff)");
        }
        console.log('* Param06 (Staff2 address):.........' + args.staff2addr);
        console.log('* Param07 (Staff2 password):........' + args.staff2pass);
        console.log('* Param08 (Staff2 Val):.............' + args.staff2val);
        if(await act.tryActions(api_main.runPollStaff, showProgress, false, 5, false, args.staff2addr, args.staff2pass, mainaddr, args.staff2val) == false) {
            throw new Error("Failed! (runPollStaff)");
        }
        console.log('* Param09 (Staff3 address):.........' + args.staff3addr);
        console.log('* Param10 (Staff3 password):........' + args.staff3pass);
        console.log('* Param11 (Staff3 Val):.............' + args.staff3val);
        if(await act.tryActions(api_main.runPollStaff, showProgress, false, 5, false, args.staff3addr, args.staff3pass, mainaddr, args.staff3val) == false) {
            throw new Error("Failed! (runPollStaff)");
        }
        await act.batchDeploy(showBatchDeploy, args.owner, args.passwd);
        let mainobj = await api_main.getObject(mainaddr);
        let staff_info = mainobj.getStaffInfo(args.staff1addr);
        console.log("### 투표 시각 ==> ", staff_info[2].toString(10));
        console.log("    토큰 보유량 ==> ", staff_info[3].toString(10));
        console.log("    투표 값 ==> ", staff_info[4]);
        staff_info = mainobj.getStaffInfo(args.staff2addr);
        console.log("### 투표 시각 ==> ", staff_info[2].toString(10));
        console.log("    토큰 보유량 ==> ", staff_info[3].toString(10));
        console.log("    투표 값 ==> ", staff_info[4]);
        staff_info = mainobj.getStaffInfo(args.staff3addr);
        console.log("### 투표 시각 ==> ", staff_info[2].toString(10));
        console.log("    토큰 보유량 ==> ", staff_info[3].toString(10));
        console.log("    투표 값 ==> ", staff_info[4]);
    } catch(err) {
        console.log(err);
    }
}
RunProc();