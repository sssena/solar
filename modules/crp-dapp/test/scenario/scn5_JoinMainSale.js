const fs = require('fs'); // For 시나리오 params
const path = require('path'); // For 시나리오 params
let act = require("../../api/api_action.js");
let provider = require("../../api/provider.js");
let api_salemain = require("../../api/api_salemain.js");

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
 * @author sykang
 */
let RunProc = async () => {
    try {
        ClearScreen();
        let args_dir = path.resolve(__dirname, 'args');
        let params = fs.readFileSync(args_dir + '/scn5.json');
        let args = JSON.parse(params);
        /* 파라메터 체크 */
        console.log('* Param00 (sale main address):.......' + args.mainsale);
        console.log('.....................................');
        console.log('* Param01 (buyer01 address):.........' + args.buyer01);
        console.log('* Param02 (buyer01 passwd):..........' + args.passwd01);
        console.log('* Param03 (buyer01 send amount):.....' + args.amount01);

        if(await act.tryActions(api_salemain.sendCrpToMainCrowd, showProgress, false, 5, true, args.buyer01, args.passwd01, args.mainsale, provider.web3.toWei( args.amount01, 'ether')) == false) {
            throw new Error("Failed! (buyer01)");
        }
        console.log('* Param11 (buyer02 address):.........' + args.buyer02);
        console.log('* Param12 (buyer02 passwd):..........' + args.passwd02);
        console.log('* Param13 (buyer02 send amount):.....' + args.amount02);
        if(await act.tryActions(api_salemain.sendCrpToMainCrowd, showProgress, false, 5, true, args.buyer02, args.passwd02, args.mainsale, provider.web3.toWei( args.amount02, 'ether')) == false) {
            throw new Error("Failed! (buyer02)");
        } 
        console.log('* Param21 (buyer03 address):.........' + args.buyer03);
        console.log('* Param22 (buyer03 passwd):..........' + args.passwd03);
        console.log('* Param23 (buyer03 send amount):.....' + args.amount03);
        if(await act.tryActions(api_salemain.sendCrpToMainCrowd, showProgress, false, 5, true, args.buyer03, args.passwd03, args.mainsale, provider.web3.toWei( args.amount03, 'ether')) == false) {
            throw new Error("Failed! (buyer03)");
        }
        console.log('* Param31 (buyer04 address):.........' + args.buyer04);
        console.log('* Param32 (buyer04 passwd):..........' + args.passwd04);
        console.log('* Param33 (buyer04 send amount):.....' + args.amount04);
        if(await act.tryActions(api_salemain.sendCrpToMainCrowd, showProgress, false, 5, true, args.buyer04, args.passwd04, args.mainsale, provider.web3.toWei( args.amount04, 'ether')) == false) {
            throw new Error("Failed! (buyer04)");
        }
        let mainsaleobj = await api_salemain.getObject(args.mainsale);
        let buyer_info = mainsaleobj.sales(args.buyer01);
        console.log("### 계정 ==========> ", buyer_info[1].toString());
        console.log("    송금 Crp량 ====> ", buyer_info[2].toNumber());
        console.log("    교환 토큰량 ===> ", buyer_info[3].toNumber());
        buyer_info = mainsaleobj.sales(args.buyer02);
        console.log("### 계정 ==========> ", buyer_info[1].toString());
        console.log("    송금 Crp량 ====> ", buyer_info[2].toNumber());
        console.log("    교환 토큰량 ===> ", buyer_info[3].toNumber());
        console.log("    송금 Crp량 ====> ", buyer_info[2].toNumber());
        console.log("    교환 토큰량 ===> ", buyer_info[3].toNumber());
        buyer_info = mainsaleobj.sales(args.buyer04);
        console.log("### 계정 ==========> ", buyer_info[1].toString());
        console.log("    송금 Crp량 ====> ", buyer_info[2].toNumber());
        console.log("    교환 토큰량 ===> ", buyer_info[3].toNumber());
    } catch(err) {
        console.log(err);
    }
}
RunProc();