import React, { Component } from 'react';

// local components
import { web3 } from '../../../web3';

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

    //    this.setState({ accounts: [] });
  }

  // Get list of accounts
  getAccountList() {
    return new Promise( ( resolve, reject ) => {
      web3.eth.getAccounts( (error, result) => {
        if ( error ) { reject( error ); }
        resolve( result );
      });
    });
  }

  // Get balance of address
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
      accounts.push({ address: address, balance: balance.toString() });
    }

    this.setState({ accounts: accounts });
  }

  render() {
    return (
      <div>
        account
        <ul>
          {
            this.state.accounts.map( (item) => {
              return <li key={item.address}>{item.address} <p>{item.balance}</p></li>;
            })
          }
        </ul>
        </div>
    );
  }
}

export default Account;
