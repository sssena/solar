/*
 * @author. sena@soompay.net
 * @comment. return web3 object from electron.
 */

var Web3 = class Web3 {
  constructor(){
    this.web3 = require('electron').remote.getGlobal('web3');
  }

  ping(){
    return 'pong';
  }

  // How can I call a function with string( function name )?
  
  personal_newAccount( password ) {
    return new Promise( ( resolve, reject ) => {
      this.web3.personal.newAccount( password, (error, result) => {
        if ( error ) { reject( error ); }
        resolve( result );
      });
    });
  }

  eth_getAccounts() {
    return new Promise( ( resolve, reject ) => {
      this.web3.eth.getAccounts( (error, result) => {
        if ( error ) { reject( error ); }
        resolve( result );
      });
    });
  }

  eth_getBalance( address ) {
    return new Promise ( ( resolve, reject ) => {
      this.web3.eth.getBalance( address, ( error, result )=>{
        if ( error ) { reject( error ); }
        resolve( result );
      });
    });
  }
}

//var web3 = new Web3();
export var web3 = new Web3();
//{ Web3 };

//module.exports = { web3 };
