import path from 'path';
import fs from 'fs';
import { web3 } from '../web3';

const logger = require('electron').remote.getGlobal('logger');
//const web3 = require('electron').remote.getGlobal('web3');
//const web3 = require('../../modules/crp-web3');

const abiPath = path.resolve( './modules/contracts/cmds/abi/CrpMain.abi' );
const abi = fs.readFileSync( abiPath, 'utf-8' );
const dataPath = path.resolve( './modules/contracts/cmds/data/CrpMain.data' );
const data = fs.readFileSync( dataPath, 'utf-8' );

function milisleep( milliSeconds ) {
    return new Promise( resolve => setTimeout( resolve, milliSeconds ) );
}

/* @author. sena@soompay.net
 * @comment. create contract.
 * @param. {
 *             owner : project owner account address,
 *             title,
 *             token: {
 *               name : token name
 *               symbol : token symbol
 *             },
 *             crowdsale: { // not array this time. but will be.
 *               date : { startDate, endDate }
 *               firstWithdrawal (optional. *mendatory for first crowdsale)
 *               softcap
 *               hardcap
 *               additionalSupply
 *               exchangeRatio
 *               crpRange : { min, max }
 *             },
 *             staff (array) : [{
 *               address
 *               ratio
 *             }],
 *             roadmaps (array) : roadmaps [{
 *               date : { startDate, endDate }
 *               withdrawal 
 *             }]
 *          }
 * */
async function runCommands( params ){
    let error = undefined;
    let MainContract = web3.eth_contract( JSON.parse( abi ) );

    if ( !MainContract ){ 
        error = 'Main Contract doesn\t exist.';
        logger.error( error ); 
        return { result: false, error: error }
    }

    if ( !data ){
        error = 'Data file doesn\'t exist.'; 
        logger.error( error ); 
        return { result: false, error: error }
    }

    let bytedataWithParams = await MainContract.new.getData( params.title, { data: data } );
    logger.debug( 'bytedataWithParams', bytedataWithParams );

    let estimatedGas = await web3.eth_estimateGas({ data: bytedataWithParams });
    logger.debug( 'estimatedGas', estimatedGas );

    // let contract = await MainContract.new( params.title, {
    //     from: params.owner,
    //     data: data,
    //     gas: estimatedGas
    // }); 
    // logger.debug('Create Tx to create contract. [tx hash=', contract.transactionHash, ']');

    // let receipt = undefined;
    // do {
    //     receipt = await web3.eth_getTransactionReceipt( contract.transactionhas );
    //     if( receipt ){
    //         logger.info('Create contract[address=', receipt.contractAddress, ']');
    //         // success
    //         resolve({ result: true, data: receipt.contractAddress });
    //         break;
    //     }
    //     logger.debug('sleep')
    //     await milisleep( 4000 );
    // } while( !receipt )
}

export default function createMainContract( params ) {
    return runCommands(params);
};
