var Inter = artifacts.require("./CrpInfc");
var Main = artifacts.require("./CrpMain");
var Token = artifacts.require("./CrpToken");
var Fund = artifacts.require("./CrpFund");
var SaleMain = artifacts.require("./CrpSaleMain");
var PollRoadmap = artifacts.require("./CrpPollRoadmap");

module.exports = function (deployer, network) {
    if (network == 'live') {
        console.log("process migrations... network: ", network);
        console.log("deploy contracts...");

        web3.personal.unlockAccount(web3.eth.accounts[0], "qazbnm1231"); // unlock owner account
        // SoomToken contracts deploys only once (overwrite: false)
        deployer.deploy(SoomToken, TOTAL_SUPPLY, {
            overwrite: false
        });
    } else {
        if (network != 'test') {
            console.log("process migrations... network: ", network);
            console.log("deploy contracts...");

            const name = "Test of Token"
            const symbol = "TOT"; // total supply
            const title = "Game Of Thrones"
            const TOKEN_OWNER = web3.eth.accounts[0]; // owner address of token
            const staff01 = web3.eth.accounts[1];
            const staff02 = web3.eth.accounts[2];
            // SoomToken contracts deploys only once (overwrite: false)
            //web3.eth.defaultAccount = web3.eth.accounts[0];

            let main;

            let start = 1548834027;
            let end = 1548880000;
            //1000000000000000000;
            let softcap = 10000000000000000000;
            let hardcap = 20000000000000000000;
            let rate = 40;
            let max = 5000000000000000000;
            let min = 1000000000000000000;
            let ratio = 1000;
            let init = 5000000000000000000;

            let start01 = 1551000000;
            let end01 = 1559000000;

            let start02 = 1561000000;
            let end02 = 1569000000;

            deployer.deploy(Main, {
                from: TOKEN_OWNER,
                overwrite: false
            }).then(function (instance) {
                main = instance;
                console.log('Create Success main:[', main.address, ']');
                // main.setStaffInfo(staff01, 10, {
                //     from: TOKEN_OWNER
                // });
                return deployer.deploy(Token, name, symbol, title, main.address, {
                     from: TOKEN_OWNER
                });
                //     console.log('staff01');
                // }).then(function () {
                //     main.setStaffInfo(staff02, 10, {
                //         from: TOKEN_OWNER
                //     });
                //     console.log('staff02');
                // }).then(function () {
                //     main.setTokenParams(name, symbol, {
                //         from: TOKEN_OWNER
                //     });
                //     console.log('token');
                // }).then(function () {
                //     main.setSaleMainParams(start, end, softcap, hardcap, rate, max, min, ratio, init, {
                //         from: TOKEN_OWNER
                //     });
                //     console.log('slaeMain');
                // }).then(function () {
                //     main.setRoadMapPlan(start01, end01, 1000);
                //     console.log('roadMap01');
                // }).then(function () {
                //     main.setRoadMapPlan(start02, end02, 1000);
                //     console.log('roadMap02');           
                // }).then(function(){            
            }).then(function (instance) {
                 token = instance;
                 console.log('Create Success token:[', token.address, ']');                 
            });
        }
    }
};