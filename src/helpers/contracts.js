import path from 'path';
import fs from 'fs';
import { web3 } from '../web3';

const logger = require('electron').remote.getGlobal('logger');
const abiPath = path.resolve( './modules/contracts/cmds/abi/CrpMain.abi' );
const abi = fs.readFileSync( abiPath, 'utf-8' );
const dataPath = path.resolve( './modules/contracts/cmds/data/CrpMain.data' );
const data = fs.readFileSync( dataPath, 'utf-8' );

function milisleep( milliSeconds ) {
    return new Promise( resolve => setTimeout( resolve, milliSeconds ) );
}

/* @author. sena@soompay.net
 * @comment. make permission transaction with admin account & target account.
 * @param. target : project owner account address,
 */

async function authorize( target ){
    try{
        let admin = await web3.eth_getAdminAddress();
        if( !await web3.eth_isAccount( admin ) ){
            throw new Error('Admin account is not exist in the local wallet!');
        }

        let gas = await web3.eth_estimateGas({ from: admin }); 
        let unlocked = await web3.personal_unlockAccount( admin, "1", gas ); // TODO: extract password
        if( !unlocked ){
            throw new Error('Fail to unlock admin account.');
        }
        let tx = await web3.eth_sendPermissionTx( admin, target, gas );
        let receipt = null;
        do {
            receipt = await web3.eth_getTransactionReceipt( tx );
            if( receipt ) {
                logger.debug('(Authorize) transaction receipt:' + receipt.status );
                break;
            }
            logger.debug('(Authorize) wait for transaction receipt.');

            await milisleep(4000);
        } while( !receipt );
    } catch( error ){
        logger.error( error );
        throw error;
    } 
    return true;
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
    let MainContract = await web3.eth_contract( JSON.parse( abi ) );

    if ( !MainContract ){ 
        error = 'Main Contract doesn\'t exist.';
        logger.error( error ); 
        return { result: false, error: error }
    }

    if ( !data ){
        error = 'Data file doesn\'t exist.'; 
        logger.error( error ); 
        return { result: false, error: error }
    }

    try{
        let bytedataWithParams = await MainContract.new.getData( params.title, { data: data } );
        let estimatedGas = await web3.eth_estimateGas({ data: bytedataWithParams });

        logger.debug( 'estimated gas: ', estimatedGas );
        logger.debug( 'main contract: ', MainContract );

        // TODO: stucked
        let contract = await MainContract.new( params.title, {
            from: params.owner,
            data: data,
            gas: estimatedGas
        }).catch( error => {
            logger.error( error );
            throw error;
        }); 
        logger.debug( 'Main contract:', contract );

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
    } catch( error ){
        logger.error( error )
        throw error;
    } finally {
        logger.info( 'create contract' );
        return{ result: true, error: error };
    }

}

async function createMainContract( params ) {
    let result = false;
    result = await authorize( params.owner );
    result = await runCommands( params );
    return result;

};

export default createMainContract;
