const Main = artifacts.require("CrpMain");
const BigNumber = web3.BigNumber;

require("chai")
    .use(require("chai-bignumber")(BigNumber))
	.should();

contract("testMain", function() {
    let main;

    const owner = web3.eth.accounts[0];
    const user1 = web3.eth.accounts[1];
    const user2 = web3.eth.accounts[2];
   
    const _name = "test of token 0.1";
    const _symbol = "ToT";
    const _title = "Game Of Thrones"

    const _startSale = 1547800653;
    const _endSale = 1557800653;
    //1000000000000000000;
    var _softCap = "15000000000000000000";
    var _hardCap = "20000000000000000000";
    var _foundRate = 40;
    var _max = "5000000000000000000";
    var _min = "1000000000000000000";
    var _ratio = 1000;
    var _init = "3000000000000000000";

    let start01 = 1551000000;
    let end01 = 1559000000;

    let start02 = 1561000000;
    let end02 = 1569000000;

    before(async function() { //deploy    
        main = await Main.new({ from: owner});                   
    });
    //test procedure

    describe("init", () => {
        it("regist staff", async function(){
            await main.setStaffInfo(owner, 40, {from: owner});
            await main.setStaffInfo(user1, 30, {from: owner});
            await main.setStaffInfo(user2, 30, {from: owner});
        });
        it("set token params", async function(){
            await main.setTokenParams(_name, _symbol, _title, {from : owner});
        });
        it("set sale params", async function(){
            await main.setSaleMainParams(_startSale, _endSale, _softCap, _hardCap, _foundRate, _max, _min, _ratio, _init, {from: owner});
        });
        it("set roadmap element", async function(){
            await main.setRoadmapParams(start01, end01, 3000000000000000000, {from: owner});
            await main.setRoadmapParams(start02, end02, 3000000000000000000, {from: owner});
        });
    });       

    describe("1. changeStage", () => {
        it("1.1 deployed", async function(){
            await main.changeStage(0);
        });
        it("1.2 init", async function(){
            await main.changeStage(1);
        });
        it("1.3 READY", async function(){
            await main.changeStage(2);
        });
        it("1.4 SAILING", async function(){
            await main.changeStage(3);
        });
        it("1.5 PROCEEDING", async function(){
            await main.changeStage(4);
        });
        it("1.6 FAILED", async function(){
            await main.changeStage(5);
        });
        it("1.7 ENDED", async function(){
            await main.changeStage(6);
        });
    });

    describe("2. poll staff", () => {
        it("2.1 vote", async function(){
            await main.setStaffInfo(owner, 40, {from: owner});
            await main.setStaffInfo(user1, 30, {from: owner});
            await main.setStaffInfo(user2, 30, {from: owner});
            await main.pollStaff(true, {from: owner});
            await main.pollStaff(true, {from: user1});
            await main.pollStaff(true, {from: user2});
        });
        it("2.2 cancle vote", async function(){
            await main.setStaffInfo(owner, 40, {from: owner});
            await main.pollStaff(true, {from: owner});
            await main.cancelPoll({from: owner});
        });
        it("2.3 halt poll", async function(){
            await main.pollHalt({from: owner});
        });
    });    
});