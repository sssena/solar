const Web3 = require('../modules/crp-web3');

let web3 = new Web3();
web3.setProvider( new Web3.providers.HttpProvider( 'http://localhost:8545' ));

exports.web3 = web3;

/*
 * @author. sena@soompay.net
 * @comment. return web3 object from electron.
 */
// var Web3 = class Web3 {
//     constructor(){
//         this.web3 = new CrpWeb3();
//         this.web3.setProvider( new CrpWeb3.providers.HttpProvider( 'http://localhost:8545' ));
// 
//         logger.debug( 'Web3 for components: ', this.web3.currentProvider );
//     }
// 
//     ping(){
//         return 'pong';
//     }
// 
//     sleepPing( millisec ){
//         return new Promise( resolve => setTimeout( resolve, millisec ) );
//     }
// 
//     getPeerCount(){
//         return new Promise ( ( resolve, reject ) => {
//             resolve( this.web3.net.peerCount );
//         });
//     }
// 
//     getVersion(){
//         return new Promise ( ( resolve, reject ) => {
//             resolve({ 
//                 node: this.web3.version.node,
//                 api: this.web3.version.api
//             });
//         });
//     }
// 
//     getBlockNumber(){
//         return new Promise ( ( resolve, reject ) => {
//             resolve( this.web3.eth.blockNumber );
//         });
//     }
// 
//     personal_loginAccount( address, password ) {
//         return new Promise ( ( resolve, reject ) => {
//             this.web3.personal.loginAccount( address, password, ( error, result ) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     personal_unlockAccount( address, password, duration ) {
//         return new Promise ( ( resolve, reject ) => {
//             this.web3.personal.unlockAccount( address, password, duration, ( error, result ) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     personal_newAccount( password ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.personal.newAccount( password, (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getAccounts() {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.getAccounts( (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_isAccount( address ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.isAccount( address, ( error, result ) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getAdminAddress() {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.getAdminAddress( (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getBalance( address ) {
//         return new Promise ( ( resolve, reject ) => {
//             this.web3.eth.getBalance( address, ( error, result ) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_sendTransaction( object ) {
//         return new Promise ( ( resolve, reject ) => {
//             this.web3.eth.sendTransaction( object, ( error, result ) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_sendPermissionTx( admin, target, gas ) {
//         return new Promise ( ( resolve, reject ) => {
//             this.web3.eth.sendPermissionTx( admin, target, gas, ( error, result ) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
//     
//     eth_getTransaction( hash ) {
//         return new Promise ( ( resolve, reject ) => {
//             this.web3.eth.getTransaction( hash, ( error, result ) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getTransactionReceipt( hash ) {
//         return new Promise ( ( resolve, reject ) => {
//             this.web3.eth.getTransactionReceipt( hash, ( error, result ) => {
//                 if ( error ) { reject(); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getAllTransactionList( address ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.getTransactionList( address, (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getEoaTransactionList( address ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.getEoaTransactionList( address, (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getTransactionReceipt( hash ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.getTransactionReceipt( hash, (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getMainContractAddress( address ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.getMainContractAddress( address, (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 // '0x' mean nothing.
//                 if ( result == "0x" ){
//                     result = null;
//                 }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_getTokenInfo( address ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.getTokenInfo( address, (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     eth_searchContractList( symbol ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.searchContractList( symbol, (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
// 
//     /*
//     eth_contract( abi ) {
//         return this.web3.eth.contract( abi );
//         // return new Promise( ( resolve, reject ) => {
//         //     this.web3.eth.contract( abi, (error, result) => {
//         //         if ( error ) { reject({ error: error }); }
//         //         resolve( result );
//         //     });
//         // });
//     }
// 
//     eth_estimateGas( data ) {
//         return new Promise( ( resolve, reject ) => {
//             this.web3.eth.estimateGas( data, (error, result) => {
//                 if ( error ) { reject({ error: error }); }
//                 resolve( result );
//             });
//         });
//     }
//     */
// }
