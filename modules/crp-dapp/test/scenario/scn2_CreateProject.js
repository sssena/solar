const fs = require('fs'); // For 시나리오 params
const path = require('path'); // For 시나리오 params
let provider = require("../../api/provider.js"); // For Get Main Contract Address
let act = require("../../api/api_action.js");
let api_deploy = require("../../api/api_deploy.js");
let api_main = require("../../api/api_main.js");
let utils = require("../../api/utils.js");

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
        let params = fs.readFileSync(args_dir + '/scn2.json');
        let args = JSON.parse(params);
        /* 파라메터 체크 */
        console.log('* Param01 (Owner Account):.............' + args.owner);
        console.log('* Param02 (Owner Password):............' + args.passwd);
        console.log('* Param03 (Project Title):.............' + args.title);
        let owner = args.owner;
        let passwd = args.passwd;
        let title = args.title;
        console.log("TOKEN INFO >>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log('* Param04 (Token Name):................' + args.tokenname);
        console.log('* Param05 (Token Symbol):..............' + args.tokensymbol);
        console.log('* Param06 (ST20 flag):.................' + args.st20);
        let name = args.tokenname; // 토큰 이름
        let symbol = args.tokensymbol; // 토큰 심볼
        let sto = args.st20; // ST20 사용 여부
        console.log("CROWDSALE INFO >>>>>>>>>>>>>>>>>>>>>>>>");
        console.log('* Param07 (Sale Start Time):...........' + args.salestart);
        console.log('* Param08 (Sale End Time):.............' + args.saleend);
        console.log('* Param09 (Softcap):...................' + args.softcap);
        console.log('* Param10 (Hardcap):...................' + args.hardcap);
        console.log('* Param11 (Additional Issue Rate):.....' + args.foundrate);
        console.log('* Param12 (Max CRP Coin):..............' + args.maxcrp);
        console.log('* Param13 (Min CRP Coin):..............' + args.mincrp);
        console.log('* Param14 (Exchange Ratio):............' + args.ratio);
        console.log('* Param15 (Initial Withdraw Amount):...' + args.withdrawal);
        let salestart = args.salestart; // 세일 시작 시각
        let saleend = args.saleend; // 세일 종료 시각
        let softcap = utils.getWei(args.softcap); // Softcap
        let hardcap = utils.getWei(args.hardcap); // Hardcap
        let foundation = args.foundrate; // 추가 발행 비율
        let maxcrp = utils.getWei(args.maxcrp); // CRP 수취 max값
        let mincrp = utils.getWei(args.mincrp); // CRP 수취 min값
        let ratio = args.ratio; // 교환 비율
        let withdrawal = utils.getWei(args.withdrawal); // 초기 인출 금액
        console.log("STAFF(1) INFO >>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log('* Param16 (Staff Address):.............' + args.staff1addr);
        console.log('* Param17 (Staff Ratio):...............' + args.staff1ratio);
        console.log("STAFF(2) INFO >>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log('* Param18 (Staff Address):.............' + args.staff2addr);
        console.log('* Param19 (Staff Ratio):...............' + args.staff2ratio);
        console.log("STAFF(3) INFO >>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log('* Param20 (Staff Address):.............' + args.staff3addr);
        console.log('* Param21 (Staff Ratio):...............' + args.staff3ratio);
        console.log("ROADMAP(1) INFO >>>>>>>>>>>>>>>>>>>>>>>");
        console.log('* Param22 (Roadmap Start Time):........' + args.roadmap1start);
        console.log('* Param23 (Roadmap End Time):..........' + args.roadmap1end);
        console.log('* Param24 (Withdraw Amount):...........' + args.roadmap1withdrawal);
        console.log("ROADMAP(2) INFO >>>>>>>>>>>>>>>>>>>>>>>");
        console.log('* Param25 (Roadmap Start Time):........' + args.roadmap2start);
        console.log('* Param26 (Roadmap End Time):..........' + args.roadmap2end);
        console.log('* Param27 (Withdraw Amount):...........' + args.roadmap2withdrawal);
        console.log("ROADMAP(3) INFO >>>>>>>>>>>>>>>>>>>>>>>");
        console.log('* Param28 (Roadmap Start Time):........' + args.roadmap3start);
        console.log('* Param29 (Roadmap End Time):..........' + args.roadmap3end);
        console.log('* Param30 (Withdraw Amount):...........' +args.roadmap3withdrawal);
        if(await act.tryActions(api_deploy.clearMca, showProgress, false, 3, true, owner, passwd) == false) {
            throw new Error("Failed! (clearMca)");
        }
        if(await act.tryActions(api_deploy.deployCrpMain, showProgress, true, 5, true, owner, passwd, title, "0xb67cda8bef2d1aa06d6620877dfb09c23a46c09b") == false) {
            throw new Error("Failed! (deployCrpMain)");
        }
        const mainaddr = await provider.web3.eth.getMainContractAddress(owner);
        if(await act.tryActions(api_main.setTokenParams, showProgress, false, 7, false, owner, passwd, mainaddr, name, symbol, sto) == false) {
            throw new Error("Failed! (setTokenParams)");
        }
        if(await act.tryActions(api_main.setMainSaleParams, showProgress, false, 13, false, 
            owner, passwd, mainaddr, salestart, saleend, softcap, hardcap, foundation,
            maxcrp, mincrp, ratio, withdrawal) == false) {
            throw new Error("Failed! (setMainSaleParams)");
        } 
        let staffaddr = args.staff1addr; // 스텝 계정 주소
        let staffratio = args.staff1ratio; // 스텝 지분율
        if(await act.tryActions(api_main.setStaffInfo, showProgress, false, 6, false, owner, passwd, mainaddr, staffaddr, staffratio) == false) {
            throw new Error("Failed! (setStaffInfo)");
        }
        staffaddr = args.staff2addr; // 스텝 계정 주소
        staffratio = args.staff2ratio; // 스텝 지분율
        if(await act.tryActions(api_main.setStaffInfo, showProgress, false, 6, false, owner, passwd, mainaddr, staffaddr, staffratio) == false) {
            throw new Error("Failed! (setStaffInfo)");
        }
        staffaddr = args.staff3addr; // 스텝 계정 주소
        staffratio = args.staff3ratio; // 스텝 지분율
        if(await act.tryActions(api_main.setStaffInfo, showProgress, false, 6, false, owner, passwd, mainaddr, staffaddr, staffratio) == false) {
            throw new Error("Failed! (setStaffInfo)");
        }
        let starttime = args.roadmap1start; // 로드맵 투표 시작 시각
        let endtime = args.roadmap1end; // 로드맵 투표 종료 시각
        withdrawal = utils.getWei(args.roadmap1withdrawal); // 투표 성공 시 인출 금액
        if(await act.tryActions(api_main.addRoadmapPollParams, showProgress, false, 7, false, owner, passwd, mainaddr, starttime, endtime, withdrawal) == false) {
            throw new Error("Failed! (addRoadmapPollParams)");
        }
        starttime = args.roadmap2start; // 로드맵 투표 시작 시각
        endtime = args.roadmap2end; // 로드맵 투표 종료 시각
        withdrawal = utils.getWei(args.roadmap2withdrawal); // 투표 성공 시 인출 금액
        if(await act.tryActions(api_main.addRoadmapPollParams, showProgress, false, 7, false, owner, passwd, mainaddr, starttime, endtime, withdrawal) == false) {
            throw new Error("Failed! (addRoadmapPollParams)");
        }
        starttime = args.roadmap3start; // 로드맵 투표 시작 시각
        endtime = args.roadmap3end; // 로드맵 투표 종료 시각
        withdrawal = utils.getWei(args.roadmap3withdrawal); // 투표 성공 시 인출 금액
        if(await act.tryActions(api_main.addRoadmapPollParams, showProgress, false, 7, false, owner, passwd, mainaddr, starttime, endtime, withdrawal) == false) {
            throw new Error("Failed! (addRoadmapPollParams)");
        }
        await act.batchDeploy(showBatchDeploy, owner, passwd);
        let mainobj = await api_main.getObject(mainaddr);
        let token_info = mainobj.token_param();
        console.log("### 토큰 이름 ==>", token_info[0]);
        console.log("    토큰 심볼 ==>", token_info[1]);
        console.log("    ST20 사용여부 ==>", token_info[2].toNumber(10));
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
        let staff_info = mainobj.getStaffInfo(args.staff1addr);
        console.log("### 스텝 ["+ args.staff1addr + "]의 보유량 = [" + staff_info[3] + "]");
        staff_info = mainobj.getStaffInfo(args.staff2addr);
        console.log("### 스텝 ["+ args.staff2addr + "]의 보유량 = [" + staff_info[3] + "]");
        staff_info = mainobj.getStaffInfo(args.staff3addr);
        console.log("### 스텝 ["+ args.staff3addr + "]의 보유량 = [" + staff_info[3] + "]");
        let roadmap_info = mainobj.roadmap_param(0);
        console.log("### 투표 시작 시각 = ["+ roadmap_info[0].toString(10) + "]");
        console.log("    투표 종료 시각 = ["+ roadmap_info[1].toString(10) + "]");
        console.log("    인출 금액 = ["+ roadmap_info[2].toString(10) + "]");
        roadmap_info = mainobj.roadmap_param(1);
        console.log("### 투표 시작 시각 = ["+ roadmap_info[0].toString(10) + "]");
        console.log("    투표 종료 시각 = ["+ roadmap_info[1].toString(10) + "]");
        console.log("    인출 금액 = ["+ roadmap_info[2].toString(10) + "]");
        roadmap_info = mainobj.roadmap_param(2);
        console.log("### 투표 시작 시각 = ["+ roadmap_info[0].toString(10) + "]");
        console.log("    투표 종료 시각 = ["+ roadmap_info[1].toString(10) + "]");
        console.log("    인출 금액 = ["+ roadmap_info[2].toString(10) + "]");
    } catch(err) {
        console.log(err);
    }
}
RunProc();