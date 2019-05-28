const path = require('path'); 
const fs = require('fs'); 
const moment = require('moment');
const logger = require('electron').remote.getGlobal('logger');
const web3 = require('../web3').web3;

// contract api
const act = require('../../modules/crp-dapp/api/api_action.js');
const api_auth = require('../../modules/crp-dapp/api/api_auth.js');
const api_deploy = require('../../modules/crp-dapp/api/api_deploy.js');
const api_main = require('../../modules/crp-dapp/api/api_main.js');
const api_salemain = require('../../modules/crp-dapp/api/api_salemain.js');
const api_token = require('../../modules/crp-dapp/api/api_token.js');
const api_fund = require('../../modules/crp-dapp/api/api_fund.js');
const api_roadmap = require('../../modules/crp-dapp/api/api_roadmap.js');
const api_withdraw = require('../../modules/crp-dapp/api/api_withdraw.js');
const api_salead = require('../../modules/crp-dapp/api/api_salead.js');
const api_refund = require('../../modules/crp-dapp/api/api_refund.js');
const api_pollsale = require('../../modules/crp-dapp/api/api_pollsale.js');

// abi and data configurations
const abiPath = path.resolve( __dirname, 'abi/CrpMain.abi' );
const abi = fs.readFileSync( abiPath, 'utf-8' );
const dataPath = path.resolve( __dirname, 'data/CrpMain.data' );
const data = fs.readFileSync( dataPath, 'utf-8' );

const tokenAbiPath = path.resolve( __dirname, 'abi/CrpToken.abi' );
const tokenAbi = fs.readFileSync( tokenAbiPath, 'utf-8' );
const tokenDataPath = path.resolve( __dirname, 'data/CrpToken.data' );
const tokenData = fs.readFileSync( tokenDataPath, 'utf-8' );

const fundAbiPath = path.resolve( __dirname, 'abi/CrpFund.abi' );
const fundAbi = fs.readFileSync( fundAbiPath, 'utf-8' );
const fundDataPath = path.resolve( __dirname, 'data/CrpFund.data' );
const fundData = fs.readFileSync( fundDataPath, 'utf-8' );

const crowdsaleAbiPath = path.resolve( __dirname, 'abi/CrpSaleMain.abi' );
const crowdsaleAbi = fs.readFileSync( crowdsaleAbiPath, 'utf-8' );
const crowdsaleDataPath = path.resolve( __dirname, 'data/CrpSaleMain.data' );
const crowdsaleData = fs.readFileSync( crowdsaleDataPath, 'utf-8' );

const roadmapPollAbiPath = path.resolve( __dirname, 'abi/CrpPollRoadmap.abi' );
const roadmapPollAbi = fs.readFileSync( roadmapPollAbiPath, 'utf-8' );
const roadmapPollDataPath = path.resolve( __dirname, 'data/CrpPollRoadmap.data' );
const roadmapPollData = fs.readFileSync( roadmapPollDataPath, 'utf-8' );

const SLEEP_TIME_TO_WAIT = 4000;

function milisleep( milliSeconds ) {
    return new Promise( resolve => setTimeout( resolve, milliSeconds ) );
}

function showProgress(result, count){
    let message = ("[" + count + "]th trial " + (result ? "Success!" : "Failed. Try again..."));
    if( (result == null) && (count == null) ){
        message = msg;
    }

    console.log( message );
}

function showBatchDeploy( result, currentIndex, total, count ) {
    if(_result == true) {
        console.log("[" + (currentIndex+1) + " / " + total + "] Tx...[" + _count + "]th trying...Success!");
    } else {
        console.log("[" + (currentIndex+1) + " / " + total + "] Tx...[" + _count + "]th trying...Failed!");
    }
}

let MainContract = web3.eth.contract( JSON.parse( abi ) );
if ( !MainContract ){ throw new Error('Main Contract doesn\'t exist.'); }

let TokenContract = web3.eth.contract( JSON.parse( tokenAbi ) );
if ( !TokenContract ){ throw new Error('Token Contract doesn\'t exist.'); }

let FundContract = web3.eth.contract( JSON.parse( fundAbi ) );
if ( !FundContract ){ throw new Error('Fund Contract doesn\'t exist.'); }

let CrowdsaleContract = web3.eth.contract( JSON.parse( crowdsaleAbi ) );
if ( !CrowdsaleContract ){ throw new Error('Crowdsale Contract doesn\'t exist.'); }

let RoadmapPollContract = web3.eth.contract( JSON.parse( roadmapPollAbi ) );
if ( !RoadmapPollContract ){ throw new Error('RoadmapPoll Contract doesn\'t exist.'); }

/* @author. sena@soompay.net
 * @comment. get main contract with address 
 * @param. mainAddress : main contract address
 */
async function getMainContract( mainAddress ){
    let mainContract = await MainContract.at( mainAddress );
    if( mainContract.address == 0x0 || mainContract.address == '0x' || mainContract == null ){
        return null;
    }
    mainContract.address = mainAddress;

    return mainContract;
}

/* @author. sena@soompay.net
 * @comment. get token contract from main address 
 * @param. mainAddress : main contract address
 */
async function getTokenContract( mainAddress ){
    let main = await MainContract.at( mainAddress );
    let tokenAddress = await main.token_addr();
    if( tokenAddress == 0x0 ){ return null; }

    let tokenContract = await TokenContract.at( tokenAddress );
    tokenContract.address = tokenAddress;

    return tokenContract;
}

/* @author. sena@soompay.net
 * @comment. get token contract from token contract address 
 * @param. tokenAddress : token contract address
 */
async function getTokenContractWithAddress( tokenAddress ){
    return await TokenContract.at( tokenAddress );
}

/* @author. sena@soompay.net
 * @comment. get fund contract from main address 
 * @param. mainAddress : main contract address
 */
async function getFundContract( mainAddress ){
    let main = await MainContract.at( mainAddress );
    let fundAddress = await main.fund_addr();
    if( fundAddress == 0x0 ){ return null; }

    let fundContract = await FundContract.at( fundAddress );
    fundContract.address = fundAddress;

    return fundContract;
}

/* @author. sena@soompay.net
 * @comment. get main crowdsale contract from main address 
 * @param. mainAddress : main contract address
 */
async function getFirstCrowdsaleContract( mainAddress ){
    let main = await MainContract.at( mainAddress );
    let crowdsaleAddress = await main.crowd_addrs(0, { from: main.owner() })
    if( crowdsaleAddress == 0x0 || crowdsaleAddress == '0x' ){ 
        return null; 
    }

    let crowdsaleContract = await CrowdsaleContract.at( crowdsaleAddress );
    crowdsaleContract.address = crowdsaleAddress;

    return crowdsaleContract;
}

/* @author. sena@soompay.net
 * @comment. get all crowdsale contracts from main address.
 *           index 0 is a main sale, others are additional crowdsales.
 * @param. mainAddress : main contract address
 */
async function getCrowdsales( mainAddress ){
    let main = await MainContract.at( mainAddress );
    let crowdsaleCount = main.getPollSaleContractNum().toNumber();
    let crowdsaleList = [];

    for( var i = 0; i < crowdsaleCount; i++ ){
        let address = await main.crowd_addrs(i, { from: main.owner() })
        if( address == 0x0 || address == '0x' ) continue;

        let crowdsale = await CrowdsaleContract.at( address );
        crowdsale.address = address;
        crowdsale.type = i == 0 ? 'main' : 'additional';

        crowdsaleList.push( crowdsale );
    }
    console.log( crowdsaleList )
    return crowdsaleList;
}

/* @author. sena@soompay.net
 * @comment. get roadmap contracts from main address.
 *          if roadmap[i] has deployed, then return cotnract
 *          else return roadmap params
 * @param. mainAddress : main contract address
 */
async function getRoadmaps( mainAddress ){
    let main = await MainContract.at( mainAddress );

    // get total roadmaps from param
    let roadmaps = [];
    for( var i = 0; i < await main.getRoadmapParamsNum(); i++ ){
        let roadmap = main.roadmap_param( i, { owner: main.owner() } );
        roadmaps.push({
            address: undefined,
            owner: main.owner(),
            startDate: roadmap[0].toNumber(),
            endDate: roadmap[1].toNumber(),
            withdrawal: roadmap[2].toNumber(),
            voteInfo: {
                voteTime: 0,
                vote: undefined
            }
        });
    }

    // if there are deployed roadmap, then set info
    for( var i = 0; i < await main.getRoadmapContractNum(); i++ ){
        let address = await main.roadmap_addrs(i, { from: main.owner() });

        let roadmapContract = RoadmapPollContract.at( address );
        if( roadmapContract.address == 0x0 ){ continue; }

        roadmaps[i] = {
            address: address,
            owner: main.owner(),
            contract: roadmapContract,

            startDate: roadmapContract.poll_started().toNumber(),
            endDate: roadmapContract.poll_ended().toNumber(),
            withdrawal: roadmaps[i].withdrawal,

            agreeAddressCount: roadmapContract.agree_addr().toNumber(),
            disagreeAddressCount: roadmapContract.disagree_addr().toNumber(),
            totalAddressCount: roadmapContract.voter_count().toNumber(),

            totalHoldingAddressCount: roadmapContract.total_addr(),
            totalAgreeCount: roadmapContract.total_agree(),
            totalWeight: roadmapContract.total_weight(),

            result: roadmapContract.result_poll(),
        };
    }

    return roadmaps;
}

/* @author. sena@soompay.net
 * @comment. get additional withdraw poll list.
 * @param. address : target ( main contract ) address
 */
async function getWithdrawPolls( address ){
    let polls = [];
    let main = await MainContract.at( address );
    let count = await main.getWithdrawContractNum().toNumber();
    for( var i = 0; i < count; i++ ){
        let address = await main.withdraw_addrs( i );

        let poll = await api_withdraw.getObject( address );
        poll.isEnded = (moment.unix( poll.poll_ended() )).isBefore( moment() );
        poll.isSettled = poll.settle();

        polls.push( poll );
    }
    return polls;
}

/* @author. sena@soompay.net
 * @comment. get additional withdraw poll
 * @param. address : target ( withdraw poll ) address
 */
async function getWithdrawPoll( address ){
    let poll = await api_withdraw.getObject( address );
    poll.isEnded = (moment.unix( poll.poll_ended() )).isBefore( moment() );
    poll.isSettled = poll.settle();
    return poll;
}

/* @author. sena@soompay.net
 * @comment. get additional crowdsale poll list.
 * @param. address : target ( main contract ) address
 */
async function getCrowdsalePolls( address ){
    let polls = [];
    let main = await MainContract.at( address );
    let count = await main.getPollSaleContractNum();
    for( var i = 0; i < count; i++ ){
        let address = await main.crowd_poll_addrs( i );
        let poll = await api_pollsale.getObject( address );
        poll.isEnded = (moment.unix( poll.poll_ended() )).isBefore( moment() );
        poll.isSettled = poll.settle();
        polls.push( poll );
    }
    return polls;
}

/* @author. sena@soompay.net
 * @comment. get additional crowdsale poll
 * @param. address : target ( crowdsale poll ) address
 */
async function getCrowdsalePoll( address ){
    let poll = await api_pollsale.getObject( address );
    poll.isEnded = (moment.unix( poll.poll_ended() )).isBefore( moment() );
    poll.isSettled = poll.settle();
    return poll;
}

/* @author. sena@soompay.net
 * @comment. get refund poll list.
 * @param. address : target ( main contract ) address
 */
async function getRefundPolls( address ){
    let main = await MainContract.at( address );
    let polls = [];
    let count = await main.getRefundContractNum();
    for( var i = 0; i < count; i++ ){
        let address = await main.refund_addrs( i );
        let poll = await api_refund.getObject( address );

        poll.isEnded = (moment.unix( poll.poll_ended() )).isBefore( moment() );
        poll.isSettled = !poll.settle();

        polls.push( poll );
    }
    return polls;
}

/* @author. sena@soompay.net
 * @comment. make permission transaction with admin account & target account.
 * @param. target : project owner account address
 */
async function authorize( target ){
    let admin = await web3.eth.getAdminAddress();
    if( !await web3.eth.isAccount( admin ) ){
        throw new Error('Admin account doesn\'t exist in the local wallet.');
    }

    if( await act.tryActions( api_auth.authorize, showProgress, false, 4, true, admin, '1', target) == false ){
        throw new Error('Fail to unlock admin account.');
    }

    return true;
}

/* @author. sena@soompay.net
 * @comment. create contract.
 * @param. {
 *             owner : {
 *               account: project owner account address,
 *               password: password
 *             },
 *             title,
 *             token: {
 *               name : token name,
 *               symbol : token symbol,
 *               sto: whether using sto 
 *             },
 *             crowdsales: [{
 *               date : { startDate, endDate }
 *               firstWithdrawal (optional. *mendatory for first crowdsale)
 *               softcap
 *               hardcap
 *               additionalSupply
 *               exchangeRatio
 *               crpRange : { min, max }
 *             }],
 *             staff (array) : [{
 *               address
 *               ratio
 *             }],
 *             roadmaps (array) : [{
 *               date : { startDate, endDate }
 *               withdrawal 
 *             }]
 *          }
 * */
async function createProject( params ){
    console.log( params )

    // TODO: remove authorize
    if( await authorize( params.owner.account ) == false ) {
        throw new Error("Authroize target failed. params=" + params);
    }
    logger.debug("(Create-Project) Authorise complete.");

    // clear mca 
    if( await act.tryActions( api_deploy.clearMca, showProgress, false, 3, true, 
        params.owner.account, params.owner.password ) ==  false ){
        throw new Error("Clear MCA failed. params=" + params);
    }
    logger.debug("(Create-Project) Clear MCA.");

    // deploy main
    let adminStaffDbAddress = "0xc86213f13730a4707493469aa13351f3a8608430";
    if( await act.tryActions( api_deploy.deployCrpMain, showProgress, true, 5, true, 
        params.owner.account, params.owner.password, params.title, adminStaffDbAddress) ==  false ){
        throw new Error("deployCroMain() failed.  params=" + params);
    }
    logger.debug("(Create-Project) Main contract has deployed.");

    const mainAddr = await web3.eth.getMainContractAddress( params.owner.account );
    // token 
    if(await act.tryActions( api_main.setTokenParams, showProgress, false, 7, false, 
        params.owner.account, params.owner.password, mainAddr, params.token.name, params.token.symbol, params.token.useSto ) == false) {
        throw new Error("setTokenParams() failed.  params=" + params);
    }
    logger.debug("(Create-Project) Set token parameters to main contract.");

    // crowdsale
    if(await act.tryActions( api_main.setMainSaleParams, showProgress, false, 13, false,
        params.owner.account, params.owner.password, mainAddr, 
        params.crowdsales[0].date.startDate, 
        params.crowdsales[0].date.endDate, 
        params.crowdsales[0].softcap, 
        params.crowdsales[0].hardcap, 
        params.crowdsales[0].additionalSupply,
        params.crowdsales[0].crpRange.max, 
        params.crowdsales[0].crpRange.min, 
        params.crowdsales[0].exchangeRatio, 
        params.crowdsales[0].firstWithdrawal) == false) {
        throw new Error("setmainSaleParams() failed.  params=" + params );
    }
    logger.debug("(Create-Project) Set main-crowdsale parameters to main contract.");

    // staff
    for( var i = 0; i < params.staff.length; i++ ){
        if(await act.tryActions( api_main.setStaffInfo, showProgress, false, 6, false, 
            params.owner.account, params.owner.password, mainAddr, 
            params.staff[i].address, 
            params.staff[i].ratio ) == false) {
            throw new Error("setStaffInfo() failed.  params=" + params );
        }
    }
    logger.debug("(Create-Project) Regist staff to main contract.");

    // roadmap
    for( var i = 0; i < params.roadmaps.length; i++ ){
        if(await act.tryActions( api_main.addRoadmapPollParams, showProgress, false, 7, false, 
            params.owner.account, params.owner.password, mainAddr, 
            params.roadmaps[i].date.startDate, 
            params.roadmaps[i].date.endDate, 
            params.roadmaps[i].withdrawal ) == false) {
            throw new Error("addRoadmapPollParams() failed.  params=" + params );
        }
    }
    logger.debug("(Create-Project) Set roadmaps to main contract.");

    await act.batchDeploy(showBatchDeploy, params.owner.account, params.owner.password);

    logger.debug("(Create-Project) Complete.");
    return true;
}

/* @author. sena@soompay.net
 * @comment. vote to staff poll with main contract address.
 * @param. 
 *          {
 *              contractAddress: main contract address,
 *              voter: {
 *                  account : staff account,
 *                  password: password
 *              }
 *              symbol: numeric value( 1 or 0 ) to vote. (!)This cannot be boolean type.
 *          }
 */
async function voteToStaffPoll( params ){
    if( await act.tryActions( api_main.runPollStaff, showProgress, false, 5, true, 
        params.voter.account, params.voter.password, params.contractAddress, params.symbol ) == false ){
        throw new Error('Error occured during voting to staff poll. params=' + params );
    }
    logger.debug("(Vote-Staff Poll) Complete . ");
    return true;
}

/* @author. sena@soompay.net
 * @comment. revoke staff poll with main contract address.
 * @param. 
 *          {
 *              contractAddress: main contract address,
 *              voter: {
 *                  account : staff account,
 *                  password: password
 *              }
 *          }
 */
async function cancelVoteToStaffPoll( params ){
    if( await act.tryActions( api_main.cancelPollStaff, showProgress, false, 4, true, 
        params.voter.account, params.voter.password, params.contractAddress ) == false ){
        throw new Error('Error occured during revoke to staff poll. params=' + params );
    }
    logger.debug("(Cancel-Staff Poll) Voting canceled. ");
    return true;
}

/* @author. sena@soompay.net
 * @comment. halt staff poll with main contract address.
 * @param. 
 *          {
 *              contractAddress: main contract address,
 *          }
 * @return. {
 *              result: Does function got an error?,
 *              startProject: Does Project stage has changed to 'ready' successfully?
 *          }
 */
async function haltStaffPoll( params ){
    try{
        // halt
        if( await act.tryActions( api_main.haltPollStaff, showProgress, false, 4, true, 
            params.owner.account, params.owner.password, params.contractAddress) == false ){
            throw new Error("haltPollStaff() failed.");
        }
        logger.debug("(Halt-Staff Poll) Halting staffpoll completed. ");

        let main = await api_main.getObject( params.contractAddress );
        let stage = main.stage();
        logger.debug("(Halt-Staff Poll) Main contract stage:", stage.toString());

        if( stage.toNumber() == 1 ){
            let contractAddresses = await deployContracts( params, main );
            logger.debug("(Halt-Staff Poll) Deploying contracts completed.");

            let result = await registContracts( params, main, contractAddresses );
            logger.debug("(Halt-Staff Poll) Registing sub-contracts addresses to main contract completed.");

            return { result: true, startProject: true };
        }
    } catch (error){
        return { result: false, startProject: false }
    }
    return { result: true, startProject: false };
}

async function deployContracts( params, mainContract ){
    let contracts = [];
    let showProgressWithCa = function (result, count, ca ){ 
        showProgress( result, count ); 
        if( ca != undefined ) {
            contracts.push( ca ); 
        }
    };

    // token
    let tokenParam = mainContract.token_param();
    let adminTokenDbAddress = "0xb453cac3a61949ca7844d54420cf4deb2af197ed";
    if( await act.tryActions( api_deploy.deployCrpToken, showProgressWithCa, true, 7, true,
        params.owner.account, 
        params.owner.password, 
        tokenParam[0],
        tokenParam[1],
        tokenParam[2].toNumber(10),
        adminTokenDbAddress
    ) == false ){
        throw new Error("deployCrpToken() failed.");
    }

    // fund
    if( await act.tryActions( api_deploy.deployCrpFund, showProgressWithCa, true, 3, true,
        params.owner.account, 
        params.owner.password ) == false ){
        throw new Error("deployCrpFund() failed.");
    }

    // main crowdsale
    let crowdsaleParam = mainContract.sale_param();
    if( await act.tryActions( api_deploy.deployCrpSaleMain, showProgressWithCa,
        true, 13, true,
        params.owner.account, 
        params.owner.password,
        crowdsaleParam[0].toNumber(),
        crowdsaleParam[1].toNumber(),
        crowdsaleParam[2].toNumber(),
        crowdsaleParam[3].toNumber(),
        crowdsaleParam[4].toNumber(),
        crowdsaleParam[5].toNumber(),
        crowdsaleParam[6].toNumber(),
        crowdsaleParam[7].toNumber(),
        crowdsaleParam[8].toNumber(),
        contracts[1] // deployed fund contract' address
    ) == false ){
        throw new Error("deployCrpSaleMain() failed.");
    }
    return contracts;
}

async function registContracts( params, mainContract, contractAddresses ){
    // token
    if( await act.tryActions( api_main.setTokenAddress, showProgress, false, 5, false,
        params.owner.account, params.owner.password, mainContract.address, contractAddresses[0]) == false ){
        throw new Error("setTokenAddress() failed.");
    }
    logger.debug("Set token contract address(%s) to main.", contractAddresses[0]);

    // fund
    if( await act.tryActions( api_main.setFundAddress, showProgress, false, 5, false,
        params.owner.account, params.owner.password, mainContract.address, contractAddresses[1]) == false ){
        throw new Error("setFundAddress() failed.");
    }
    logger.debug("Set fund contract address(%s) to main.", contractAddresses[1]);

    // crowdsale
    if( await act.tryActions( api_main.addCrowdSaleAddress, showProgress, false, 5, false,
        params.owner.account, params.owner.password, mainContract.address, contractAddresses[2]) == false ){
        throw new Error("addCrowdsaleAddress() failed.");
    }
    logger.debug("Add crowdsale contract address(%s) to main.", contractAddresses[2]);
    return true;
}

async function voteToRoadmapPoll( params ){
    if( !await act.tryActions( api_roadmap.polling, showProgress, false, 5, true,
        params.voter.account, params.voter.password, params.roadmapAddress, params.symbol )){
        return false;
    }
    logger.debug("(Vote-RoadmapPoll) Voted to crowdsale. ");
    return true;
}

async function cancelVoteToRoadmapPoll( params ){
    if( !await act.tryActions( api_roadmap.cancelPoll, showProgress, false, 4, true,
        params.voter.account, params.voter.password, params.roadmapAddress )){
        return false;
    }
    logger.debug("(Cancel-RoadmapPoll) Cancel vote to crowdsale. ");
    return true;
}

async function joinToCrowdsale( params ){
    //TODO: check refund amount
    //let gas = await sale_main.buyToken.estimateGas({from: _sender, to: _receiver, value: amount});

    if( await act.tryActions( api_salemain.sendCrpToMainCrowd, showProgress, false, 5, true, 
        params.donor.account, params.donor.password, params.crowdsaleAddress, params.amount ) == false ){
        return false;
    }
    logger.debug("(Join-Crowdsale) Joined to crowdsale. ");
    return true;
}

async function getStaffInfo( params ){
    let result = await params.contract.getStaffInfo( params.staffAddress );
    //if( result[0] == 0x0 && result[1] == 0x0 ){ return {}; }

    return {
        prev: result[0].toString(),
        next: result[1].toString(),
        votedTime: result[2].toNumber(),
        holdingRatio: result[3].toNumber(),
        vote: result[4]
    };
}

async function getStaffPollInfo( params ){
    let result = await params.contract.staff_list();
    return {
        head:            result[0],
        tail:            result[1],
        totalStaffCount: result[2].toNumber(),
        result:          result[3].toNumber(),
        startDate:       result[4].toNumber(),
        endDate:         result[5].toNumber(),
    };
}

async function tokenTransfer( params ){
    if( await act.tryActions( api_token.transfer, showProgress, false, 6, true, 
        params.owner.account, params.owner.password, params.tokenAddress, params.to, params.amount ) == false ){
        return false;
    }
    logger.debug("(Token-Transfer) Transfer token successfully.");
    return true;
}

async function haltCrowdsale( params ){
    let result = false;
    let crowdsaleResult = false;
    try{
        // halt
        if( await act.tryActions( api_salemain.haltMainSale, showProgress, false, 4, true, 
            params.owner.account, params.owner.password, params.crowdsaleAddress ) == false ){
            return { result: false, crowdsalResult: false };
        }

        let crowdsale = await api_salemain.getObject( params.crowdsaleAddress );
        crowdsaleResult = crowdsale.total_staff_CRP().toNumber();
        if( crowdsaleResult != 0 ) {
            if( ! await act.tryActions( api_main.changeStage, showProgress, false, 5, true, params.owner.account, params.owner.password, params.address, 3) ){
                return { result: false, crowdsaleResult: true };
            }
            result = await haltCrowdsale_success( params );
        } else {
            if( ! await act.tryActions(api_main.changeStage, showProgress, false, 5, true, params.owner.account, params.owner.password, params.address, 4) ) {
                return { result: false, crowdsaleResult: false };
            }
            result = await haltCrowdsale_fail( params );
        }
    } catch( error ){
        console.error( error );
        result = false;
        crowdsaleResult = false;
    }

    if( result) logger.debug("(Crowdsale-Halt) Halt crowdsale successfully.");
    else        logger.debug("(Crowdsale-Halt) Halt crowdsale failed.");

    return { result: result, crowdsaleResult: crowdsaleResult };
}

async function haltCrowdsale_success( params ){
    let contract = await getMainContract( params.address );
    let crowdsale = await api_salemain.getObject( params.crowdsaleAddress );
    let tokenContractAddress = await contract.token_addr();
    let count = crowdsale.chain_count();
    let nowPosition = crowdsale.chain_head();

    // issue
    for( var i = 0; i < count; i++ ){
        let buyer = crowdsale.sales( nowPosition );
        if( ! await act.tryActions( api_token.issue, showProgress, false, 8, false, 
            params.owner.account, params.owner.password, tokenContractAddress, nowPosition, buyer[3], 0, 1) ){
            return false;
        }
        nowPosition = buyer[5];
    }
    await act.batchDeploy( showBatchDeploy, params.owner.account, params.owner.password );

    // settle
    let staffList = await contract.staff_list();
    nowPosition = staffList[0];

    for( var i = 0; i < staffList[2]; i++ ){
        let result = crowdsale.total_staff_CRP().toNumber();
        let staffInfo = contract.getStaffInfo( nowPosition );
        let staffAmount = ( result * staffInfo[3] ) / 100;
        if( ! await act.tryActions( api_token.setGuarantee, showProgress, false, 6, false,
            params.owner.account, params.owner.password, tokenContractAddress, nowPosition, staffAmount ) ){
            return false;
        }
        nowPosition = staffInfo[1];
    }
    await act.batchDeploy( showBatchDeploy, params.owner.account, params.owner.password );

    // fund withdraw
    if( ! await act.tryActions( api_salemain.transferFund, showProgress, false, 4, true, params.owner.account, params.owner.password, params.crowdsaleAddress )){
        return false;
    }

    let fundAddress = contract.fund_addr();
    let availableHardcap = await crowdsale.availe_hard();
    if( ! await act.tryActions( api_fund.setAvaileHard, showProgress, false, 5, true, params.owner.account, params.owner.password, fundAddress, availableHardcap )){
        return false;
    }

    // withdraw
    let crowdsaleInfo = await crowdsale.sale_info();
    if( ! await act.tryActions( api_fund.withdraw, showProgress, false, 7, true, 
        params.owner.account, params.owner.password, fundAddress, params.owner.account, crowdsaleInfo[8], 0 )){
        return false;
    }

    // roadmap deploy
    let roadmapInfo = await contract.roadmap_param(0);
    let roadmapCa = null;
    let showProgressWithCa = function (_result, _count, _ca ){
        showProgress( _result, _count );
        if( _ca != undefined ) {
            roadmapCa = _ca;
        }
    };

    if( ! await act.tryActions( api_deploy.deployCrpPollRoadmap, showProgressWithCa, true, 6, true, 
        params.owner.account, params.owner.password, roadmapInfo[0], roadmapInfo[1], params.address )){
        return false;
    }

    if( ! await act.tryActions( api_main.addRoadmapPollAddress, showProgress, false, 5, true, params.owner.account, params.owner.password, params.address, roadmapCa)){
        return false;
    }

    return true;
}

async function haltCrowdsale_fail( params ) {
    let contract = await getMainContract( params.address );
    let crowdsale = await api_salemain.getObject( params.crowdsaleAddress );
    let count = crowdsale.chain_count();
    let nowPosition = crowdsale.chain_head();

    for( var i = 0; i < count; i++ ) {
        if( ! await act.tryActions( api_salemain.refund, showProgress, false, 5, false, params.owner.account, params.owner.password, params.address, nowPosition) ) {
            return false;
        }

        let buyerInfo = crowdsale.sales( nowPosition );
        nowPosition = buyerInfo[5];
    }
    return true;
}

async function startCrowdsale( params ){
    let result = false;
    try{
        // halt
        if( await act.tryActions( api_main.changeStage, showProgress, false, 5, true, 
            params.owner.account, params.owner.password, params.address, 2 ) == false ){
            return false;
        }
    } catch( error ){
        console.error( error );
        return false
    }

    logger.debug("(Crowdsale-Start) Start crowdsale successfully.");
    return true;
}

async function haltRoadmap( params ){
    let result = false;
    let roadmapResult = false;
    try{
        let contract = await MainContract.at( params.address );
        if( contract == undefined || contract == null || contract.address == 0x0 || contract.address == '0x'){
            return { result:false, roadmapResult: false };
        }

        // token disable
        let token = await TokenContract.at( await contract.token_addr() );
        if( token == null || token == undefined || token.address == 0x0 || token.address == '0x' ){
            return { result:false, roadmapResult: false };
        }

        if( !await act.tryActions( api_token.disableToken, showProgress, false, 4, true, params.owner.account, params.owner.password, token.address ) ){
            return { result: false, roadmapResult: false };
        }

        // get token information
        let addressCount = token.holder()[0];
        let totalSupply = token.supply();
        let agreeCount = 0;

        let roadmap = await RoadmapPollContract.at( params.roadmapAddress );
        let nowPosition = roadmap.head();

        // calculate voter's weight
        for( var i = 0; i < addressCount; i++ ){
            let voteInfo = roadmap.getVoteInfo( nowPosition );
            let tokenBalance = await Number( token.balanceOf( nowPosition ) );

            if( voteInfo[2] ){ // agree
                agreeCount += tokenBalance;
            }

            if( !await act.tryActions( api_roadmap.setAmount, showProgress, false, 6, false, 
                params.owner.account, params.owner.password, params.roadmapAddress, nowPosition, tokenBalance ) ){
                return { result: false, roadmapResult: true };
            }
            nowPosition = voteInfo[4];
        }
        await act.batchDeploy( showBatchDeploy, params.owner.account, params.owner.password );

        // settle
        if( !await act.tryActions( api_roadmap.settlePoll, showProgress, false, 7, true, 
            params.owner.account, params.owner.password, params.roadmapAddress, addressCount, totalSupply, agreeCount ) ){
            return { result: false, roadmapResult: true };
        }

        let fund = await FundContract.at( await contract.fund_addr() );
        if( fund == null || fund == undefined || fund.address == 0x0 || fund.address == '0x' ){
            return { result:false, roadmapResult: false };
        }

        roadmapResult = roadmap.result_poll();
        if( roadmapResult ) {
            result = await haltRoadmap_success( params );
        } else {
            result = await haltRoadmap_fail( params );
        }
    } catch( error ){
        console.error( error );
        result = false;
        roadmapResult = false;
    }

    if( result) logger.debug("(RoadmapPoll-Halt) Halt roadmap successfully.");
    else        logger.debug("(RoadmapPoll-Halt) Halt roadmap failed.");

    return { result: result, roadmapResult: roadmapResult };
}

async function haltRoadmap_success( params ){
    let contract = await getMainContract( params.address );
    let roadmap = await api_roadmap.getObject( params.roadmapAddress );

    let nowRoadmapPosition = contract.getRoadmapContractNum();
    let roadmapData = contract.roadmap_param( nowRoadmapPosition );
    if( roadmapData[2] != 0 ){ // depoy next roadmap
        let roadmapCa = null;
        let showProgressWithCa = function (_result, _count, _ca ){
            showProgress( _result, _count );
            if( _ca != undefined ) {
                console.log( _ca )
                roadmapCa = _ca;
            }
        };

        if( !await act.tryActions( api_deploy.deployCrpPollRoadmap, showProgressWithCa, true, 6, true, 
            params.owner.account, params.owner.password, roadmapData[0], roadmapData[1], params.address ) ){
            return false;
        }

        if( !await act.tryActions( api_main.addRoadmapPollAddress, showProgress, false, 5, true, 
            params.owner.account, params.owner.password, params.address, roadmapCa ) ){
            return false;
        }
    } else { // change stage to 'COMPLETE'
        if( !await act.tryActions( api_main.changeStage, showProgress, false, 5, true, 
            params.owner.account, params.owner.password, params.address, 5 ) ){
            return false;
        }
    }

    // withdraw
    let preLoadData = contract.roadmap_param( nowRoadmapPosition - 1 );
    if( !await act.tryActions( api_fund.withdraw, showProgress, false, 7, true, 
        params.owner.account, params.owner.password, contract.fund_addr(), params.owner.account, preLoadData[2], 0 ) ){
        return false;
    }

    // token enable
    let token = await TokenContract.at( await contract.token_addr() );
    if( token == null || token == undefined || token.address == 0x0 || token.address == '0x' ){
        return false;
    }

    if( !await act.tryActions( api_token.enableToken, showProgress, false, 4, true, params.owner.account, params.owner.password, token.address ) ){
        return false;
    }

    return true;
}

async function haltRoadmap_fail( params ) {
    let contract = await getMainContract( params.address );

    if( !await act.tryActions( api_main.changeStage, showProgress, false, 5, true, 
        params.owner.account, params.owner.password, params.address, 4 ) ){
        return false;
    }

    // get fund info
    let fund = await FundContract.at( await contract.fund_addr() );
    let fundList = fund.fund_list();
    let remain = fundList[1];

    // get token
    let token = await TokenContract.at( await contract.token_addr() );
    let totalSupply = token.supply();
    let addressCount = token.holder()[0];

    let holder = token.holder()[1];
    for( var i = 0; i < addressCount; i++ ){
        let tokenBalance = await Number( token.balanceOf( holder ) );
        let refundCrp = ( tokenBalance * remain ) / totalSupply;
        if( !await act.tryActions( api_fund.withdraw, showProgress, false, 7, false, 
            params.owner.account, params.owner.password, fund.address, holder, refundCrp, 2 ) ){
            console.error( 'Fail to refund(%d) to (%s)', refundCrp, holder );
        }
        holder = await token.nextOf( holder );
    }
    await act.batchDeploy( showBatchDeploy, params.owner.account, params.owner.password );

    return true;
}

async function onPolling( address ){
    let contract = await getMainContract( address );
    if( contract == undefined || contract == null || contract.address == 0x0 || contract.address == '0x'){
        return false;
    }
    let roadmaps = await getRoadmaps( address );

    // not proceeding 
    if( contract.stage().toString() != "3") return false;

    for( var roadmap of roadmaps ){
        if( roadmap.address == undefined ) continue;
        if( roadmap.startDate < moment().unix() && roadmap.endDate > moment().unix() ){
            return roadmap;
        }
    }
    return false;
}

async function onSale( address ){ // TODO: additional crowdsale
    let contract = await getMainContract( address );
    if( contract == undefined || contract == null || contract.address == 0x0 || contract.address == '0x'){
        return false;
    }
    let crowdsale = await getFirstCrowdsaleContract( address );
    if( crowdsale == null || crowdsale.address == undefined ){
        return false;
    }

    if( contract.stage().toString() == "2"
        && crowdsale.sale_info()[0].toNumber() < moment().unix()
        && crowdsale.sale_info()[1].toNumber() > moment().unix()
        && crowdsale.total_CRP().toNumber() < crowdsale.sale_info()[3] ){
        return true;
    }
    return false;
}

async function isRelated( address, account ){
    let contract = await getMainContract( address );
    if( contract == undefined || contract == null || contract.address == 0x0 || contract.address == '0x'){
        return false;
    }

    // check is owner
    if( account == await contract.owner().toString() ){
        return true;
    }

    // check is staff
    let staffInfo = await getStaffInfo( { contract: contract, staffAddress: account });
    if( staffInfo != undefined && staffInfo.holdingRatio > 0 ) {
        return true;
    }

    // check is doner
    let tokenContract = await getTokenContract( address );
    if( tokenContract == null && tokenContract == undefined ){ return false; } 
    if( await tokenContract.activeOf( account ) > 0 ){
        return true;
    }
}

async function addWithdrawPoll( params ){
    let contract = await getMainContract( params.address );
    let pollCa = null;
    let showProgressWithCa = function (_result, _count, _ca ){
        showProgress( _result, _count );
        if( _ca != undefined ) {
            pollCa = _ca;
        }
    };

    if( !await act.tryActions( api_deploy.deployCrpPollWithdraw, showProgressWithCa, true, 6, true, 
        params.owner.account, params.owner.password, params.startDate, params.endDate, params.amount ) ){
        logger.error( "Fail to deployCrpPollWithdraw" );
        return false;
    }

    if( !await act.tryActions( api_main.addWithdrawPollAddress, showProgress, false, 5, true, 
        params.owner.account, params.owner.password, params.address, pollCa ) ){
        logger.error( "Fail to regist CrpPollWithdraw" );
        return false;
    }

    return true;
}

async function addCrowdsalePoll( params ){
    let contract = await getMainContract( params.address );
    let pollCa = null;
    let showProgressWithCa = function (_result, _count, _ca ){
        showProgress( _result, _count );
        if( _ca != undefined ) {
            pollCa = _ca;
        }
    };

    if( !await act.tryActions( api_deploy.deployCrpPollAdSale, showProgressWithCa, true, 12, true, 
        params.owner.account, params.owner.password, params.startDate, params.endDate, params.saleStartDate, params.saleEndDate, params.premiumDate, 
        params.min, params.max, params.hardcap, params.rate ) ){
        logger.error( "Fail to deployCrpPollAdSale" );
        return false;
    }

    if( !await act.tryActions( api_main.addPollCrowdSaleAddress, showProgress, false, 5, true, 
        params.owner.account, params.owner.password, params.address, pollCa ) ){
        logger.error( "Fail to regist CrpPollSaleAd" );
        return false;
    }

    return true;
}

// async function addWithdrawPoll( params ){
//     let contract = await getMainContract( params.address );
//     let pollCa = null;
//     let showProgressWithCa = function (_result, _count, _ca ){
//         showProgress( _result, _count );
//         if( _ca != undefined ) {
//             pollCa = _ca;
//         }
//     };
// 
//     if( !await act.tryActions( api_deploy.deployCrpPollWithdraw, showProgressWithCa, true, 6, true, 
//         params.owner.account, params.owner.password, params.startDate, params.endDate, params.amount ) ){
//         logger.error( "Fail to deployCrpPollWithdraw" );
//         return false;
//     }
// 
//     if( !await act.tryActions( api_main.addWithdrawPollAddress, showProgress, false, 5, true, 
//         params.owner.account, params.owner.password, params.address, pollCa ) ){
//         logger.error( "Fail to regist CrpPollWithdraw" );
//         return false;
//     }
// 
//     return true;
// }
//

async function voteToPoll( params ){
    console.log( params )
    let api = null;
    if( params.type == "withdraw" ){
        api = api_withdraw.polling;
    } else if ( params.type == "crowdsale" ){
        api = api_pollsale.polling;
    } else if ( params.type == "refund" ){
        api = api_refund.polling;
    }

    if( !await act.tryActions( api, showProgress, false, 5, true, params.voter.account, params.voter.password, params.pollAddress, params.symbol ) ){
        logger.error( "Fail to vote to " + params.type + " poll." );
        return false;
    }
    return true;
}

async function cancelVoteToPoll( params ){
    let api = null;
    if( params.type == "withdraw" ){
        api = api_withdraw.cancelPoll;
    } else if ( params.type == "crowdsale" ){
        api = api_salead.cancelPoll;
    } else if ( params.type == "refund" ){
        api = api_refund.cancelPoll;
    }

    if( !await act.tryActions( api, showProgress, false, 4, true, params.voter.account, params.voter.password, params.pollAddress ) ){
        logger.error( "Fail to cancel vote to " + params.type + " poll." );
        return false;
    }
    return true;
}

async function haltPoll( params ){
    let contract = await getMainContract( params.address );
    let tokenContract = await getTokenContract( params.address );

    let api = null;
    if( params.type == "withdraw" ){
        console.log( 'w' )
        api = api_withdraw;
    } else if ( params.type == "crowdsale" ){
        api = api_pollsale;
        console.log( 'c' )
    } else if ( params.type == "refund" ){
        api = api_refund;
        console.log( 'r' )
    }

    // disable token
    if( !await act.tryActions( api_token.disableToken, showProgress, false, 4, true, 
        params.owner.account, params.owner.password, contract.token_addr() ) ){
        logger.error( "Fail to disable token." );
        return false;
    }

    let holders = tokenContract.holder();
    let totalHoldersCount = holders[0];
    let agreeWeight = 0;
    let poll = await api.getObject( params.pollAddress );

    let position = poll.head();
    let voterCount = poll.voter_count().toNumber();
    for(var i = 0; i < voterCount; i++ ){
        let vote = poll.getVoteInfo( position );
        let balance = await (tokenContract.balanceOf( position )).toNumber();

        if( vote[2] ){ agreeWeight += balance; }
        if( !await act.tryActions( api.setAmount, showProgress, false, 6, false,
            params.owner.account, params.owner.password, params.pollAddress, position, balance ) ){
            logger.error( "Fail to set token weight!");
            return false;
        }
        position = vote[4];
    }

    await act.batchDeploy( showBatchDeploy, params.owner.account, params.owner.password );

    if( !await act.tryActions( api.settlePoll, showProgress, false, 7, true,
        params.owner.account, params.owner.password, params.pollAddress, totalHoldersCount, tokenContract.supply(), agreeWeight )){
        logger.error("Fail to settle withdraw poll.");
        return false;
    }

    let fund = await getFundContract( params.address );
    let result = poll.result_poll();

    if( result ){
        if( params.type == "withdraw" ){
            let withdrawal = poll.withdraw_crp();
            if( !await act.tryActions( api_fund.withdraw, showProgress, false, 7, true, 
                params.owner.account, params.owner.password, contract.fund_addr(), params.owner.account, withdrawal, 1) ){
                logger.error("Fail to withdraw to owner from fund.");
                return false;
            }
        } else if ( params.type == "crowdsale" ){
            let crowdsaleCa = null;
            let showProgressWithCa = function (_result, _count, _ca ){
                showProgress( _result, _count );
                if( _ca != undefined ) {
                    crowdsaleCa = _ca;
                }
            };
            let saleInfo = poll.sale_info();
            if( !await act.tryActions( api_deploy.deployCrpSaleAd, showProgressWithCa, true, 12, true, params.owner.account, params.owner.password,
                saleInfo[0], saleInfo[1], saleInfo[2], saleInfo[3], saleInfo[4], saleInfo[5], saleInfo[6], tokenContract.address, fund.address )){
                throw new Error("Failed deploy CrpAdSale.")
            }

            if( crowdsaleCa == null ){
                throw new Error("Failed deploy CrpAdSale. ca is null");
            }

            if( !await act.tryActions( api_main.addCrowdSaleAddress, showProgress, false, 5, true, 
                params.owner.account, params.owner.password, params.address, crowdsaleCa )){
                throw new Error("Fail to regist CrpPollSaleAd .")
            }

            if( !await act.tryActions( api_token.addAdmin, showProgress, false, 5, true, 
                params.owner.account, params.owner.password, contract.token_addr(), crowdsaleCa )){
                throw new Error("Fail to add Admin.")
            }

            if( !await act.tryActions( api_fund.addAdmin, showProgress, false, 5, true, 
                params.owner.account, params.owner.password, contract.fund_addr(), crowdsaleCa )){
                throw new Error("Fail to add Admin.")
            }
        } else if ( params.type == "refund" ){
        }
    }

    if( !await act.tryActions( api_token.enableToken, showProgress, false, 4, true, 
        params.owner.account, params.owner.password, contract.token_addr() ) ){
        logger.error("Fail to enable token.");
        return false;
    }

    return true;
}

async function haltWithdrawPoll( params ){
    let contract = await getMainContract( params.address );
    let tokenContract = await getTokenContract( params.address );

    // disable token
    if( !await act.tryActions( api_token.disableToken, showProgress, false, 4, true, 
        params.owner.account, params.owner.password, contract.token_addr() ) ){
        logger.error( "Fail to disable token." );
        return false;
    }

    let holders = tokenContract.holder();
    let totalHoldersCount = holders[0];
    let agreeWeight = 0;
    let withdraw = await api_withdraw.getObject( params.pollAddress );

    let position = withdraw.head();
    let voterCount = withdraw.voter_count().toNumber();
    for(var i = 0; i < voterCount; i++ ){
        let vote = withdraw.getVoteInfo( position );
        let balance = await (tokenContract.balanceOf( position )).toNumber();

        if( vote[2] ){ agreeWeight += balance; }
        if( !await act.tryActions( api_withdraw.setAmount, showProgress, false, 6, false,
            params.owner.account, params.owner.password, params.pollAddress, position, balance ) ){
            logger.error( "Fail to set token weight!");
            return false;
        }
        position = vote[4];
    }

    await act.batchDeploy( showBatchDeploy, params.owner.account, params.owner.password );

    if( !await act.tryActions( api_withdraw.settlePoll, showProgress, false, 7, true,
        params.owner.account, params.owner.password, params.pollAddress, totalHoldersCount, tokenContract.supply(), agreeWeight )){
        logger.error("Fail to settle withdraw poll.");
        return false;
    }

    let fund = await getFundContract( params.address );
    let result = withdraw.result_poll();

    if( result ){
        let withdrawal = withdraw.withdraw_crp();
        if( !await act.tryActions( api_fund.withdraw, showProgress, false, 7, true, 
            params.owner.account, params.owner.password, contract.fund_addr(), params.owner.account, withdrawal, 1) ){
            logger.error("Fail to withdraw to owner from fund.");
            return false;
        }
    }

    if( !await act.tryActions( api_token.enableToken, showProgress, false, 4, true, 
        params.owner.account, params.owner.password, contract.token_addr() ) ){
        logger.error("Fail to enable token.");
        return false;
    }

    return true;
}


export const contractHandlers = {
    createProject,
    addWithdrawPoll,
    addCrowdsalePoll,
    //addRefundPoll,

    // getter
    getMainContract,
    getTokenContract,
    getTokenContractWithAddress,
    getFundContract,
    getFirstCrowdsaleContract,
    getCrowdsales,
    getRoadmaps,
    getWithdrawPolls,
    getWithdrawPoll,
    getCrowdsalePolls,
    getCrowdsalePoll,
    getRefundPolls,

    // get status ( roadmap, crowdsale )
    onPolling,
    onSale,
    isRelated,

    // staffpoll
    cancelVoteToStaffPoll,
    voteToStaffPoll,
    haltStaffPoll,

    tokenTransfer,

    // main sale
    startCrowdsale,
    joinToCrowdsale,
    haltCrowdsale,

    // roadmmap
    voteToRoadmapPoll,
    cancelVoteToRoadmapPoll,
    haltRoadmap,

    // polls
    voteToPoll,
    cancelVoteToPoll,

    haltPoll,

    // staff info
    getStaffInfo,
    getStaffPollInfo,
};
