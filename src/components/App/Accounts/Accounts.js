import React, { Component } from 'react';

// material-ui
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

// local components
//import web3  from '../../../web3';
import { web3 }  from '../../../web3';
import Account from '../../common/Account';
import Login from './Login';
import AddAccountForm from './AddAccountForm';

// local styles
import './Accounts.css';

/*
 * @author. sena
 * @comment. 'Accounts' shows account list from Station.
 *           can login, add account here.
 */

class Accounts extends Component {
    state = {
        openLogin: false, // Dialog open flag
        openAddAccount: false, // Dialog open flag
        activateAddress: '',
        accounts: []
    }

    /* handle function for login dialog */
    handleLoginOpen = ( address ) => {
        // Set an activated address for login
        this.setState({ openLogin: true, activateAddress: address });
    }
    handleLoginClose = () => {
        this.setState({ openLogin: false, activateAddress: '' });
    }

    /* handle function for login dialog */
    handleAddAccountOpen = () => {
        this.setState({ openAddAccount: true });
    }
    handleAddAccountClose = ( shouldBeReload ) => {
        this.setState({ openAddAccount: false });

        if( shouldBeReload ) {
            this.loadAccountsInfo();
        }
    }

    constructor() {
        super();

        // const Web3 = require('../../../../modules/crp-web3');
        // this.web3 = new Web3();
        // this.web3.setProvider( new Web3.providers.HttpProvider( 'http://localhost:8545' ));
    }

    async loadAccountsInfo() {
        let accounts = [];
        let addresses = await web3.eth_getAccounts();
        //let addresses = await web3.eth.getAccounts();

        for await ( let address of addresses ) {
            let balance = await web3.eth_getBalance( address );
            accounts.push({ address: address, balance: balance.toString() });
        }

        this.setState({ accounts: accounts });
    }

    /* componentWillMount() called automatically before mount. */
    componentWillMount() {
        this.loadAccountsInfo();
    }

    render() {
        return (
            <div className="accounts">
                <div className="account-list">
                    {
                        this.state.accounts.map( (item) => {
                            return (
                                <div key={item.address} onClick={ this.handleLoginOpen.bind(this, item.address) } >
                                    <Account 
                                        address={item.address}
                                        balance={item.balance} />
                                </div>
                            );
                        })
                    }
                </div>
                <div className="text-align-right">
                    <Button variant="contained" color="primary" className="add-account-btn" onClick={this.handleAddAccountOpen} > 
                        <PersonAddIcon/> Add account 
                    </Button>
                </div>
                <Dialog
                    open={this.state.openLogin}
                    onClose={this.handleLoginClose} >
                    <Login 
                        closeAction={this.handleLoginClose} 
                        loginAction={this.props.login} 
                        address={this.state.activateAddress} />
                </Dialog>

                <Dialog
                    open={this.state.openAddAccount}
                    onClose={this.handleAddAccountClose} >
                    <AddAccountForm closeAction={this.handleAddAccountClose}/>
                </Dialog>
            </div>
        );
    }
}

export default Accounts;
