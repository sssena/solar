import React, { Component } from 'react';

// local components
import { web3 } from '../../../web3';

function test() {
  console.log( this.state.accountlist );
}

/*
 * @author. sena
 * @comment. 'Account' is a web-browser
 */
class Account extends Component {
  state = {
    accounts: []
  }
  constructor( props ) {
    super( props );
  }

  getAccountList() {
    return new Promise( ( resolve, reject ) => {
      web3.eth.getAccounts( (error, result) => {
        if ( error ) { reject( error ); }
        resolve( result );
      });
    });
  }

  getBalance( address ) {
    return new Promise ( ( resolve, reject ) => {
      web3.eth.getBalance( address, ( error, result )=>{ 
        if ( error ) { reject( error ); }
        resolve( result );
      });
    });
  }

  /*
   * get address and balance from web3 
   * (!) before render() function called.
   *    componentWillMount called automatically before mount. */
  async componentWillMount() {
    let accounts = [];
    let addresses = await this.getAccountList();

    for await (let address of addresses ) {
      let balance = await this.getBalance( address );
      accounts.push({ address: address, balance: balance });
    }

    this.setState({ accounts: accounts });
  }

  render() {
    return (
        <div>
          {
            this.state.accounts.map( (item) => {
            return <p>{item}</p>;
            })
          }
        </div>
    );
  }
}

export default Account;
