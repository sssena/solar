import React, { Component } from 'react';

// material-ui
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

// local components
import { web3 } from '../../../web3';
import Account from '../../common/Account';
import LoginForm from '../../common/LoginForm';

// local styles
import './Accounts.css';

/*
 * @author. sena
 * @comment. 'Accounts' shows account list from Station.
 *           can login, add account here.
 */
class Accounts extends Component {
  state = {
    openLogin: false,
    activateAddress: '',
    accounts: []
  }

  handleLoginOpen = ( address ) => {
    this.setState({ openLogin: true, activateAddress: address });
  }
  handleLoginClose = () => {
    this.setState({ openLogin: false, activateAddress: '' });
  }

  constructor() {
    super();
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

    for await ( let address of addresses ) {
      let balance = await this.getBalance( address );
      accounts.push({ address: address, balance: balance.toString() });
    }

    this.setState({ accounts: accounts });
  }

  render() {
    return (
      <div className="main-frame">
        <h1> Accounts </h1>
        <div className="account-list">
          {
            this.state.accounts.map( (item) => {
              return (
                <div key={item.address} onClick={ this.handleLoginOpen.bind(this, item.address) }>
                  <Account 
                    address={item.address}
                    balance={item.balance} />
                </div>
              );
            })
          }
        </div>
        <div className="text-align-right">
          <Button variant="contained" color="primary" className="add-account-btn" > <PersonAddIcon/> Add account </Button>
        </div>
        <Dialog
          open={this.state.openLogin}
          onClose={this.handleLoginClose}
        >
          <LoginForm address={this.state.activateAddress}/>
        </Dialog>
      </div>
    );
  }
}

export default Accounts;
