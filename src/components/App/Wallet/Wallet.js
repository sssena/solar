import React, { Component } from 'react';
import { connect } from 'react-redux';
import Identicon from 'react-identicons';

// material-ui components
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import ButtonBase from '@material-ui/core/ButtonBase';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';

// icons
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SendIcon from '@material-ui/icons/Send';

// local components
import './Wallet.css';
//import web3 from '../../../web3';
import { web3 } from '../../../web3';
import Account from '../../common/Account';
import TransactionTable from './TransactionTable';
import AccountFunctions from './Wallet/AccountFunctions';
import SendTransaction from './Wallet/SendTransaction';

/*
 * @author. sena
 * @comment. 'Wallet' shows a address info.
 */
class Wallet extends Component {
    state = {
        address: '',
        balance: 0,
        anchorElement: null,
        sendTxOpen: false
    };

    constructor(){
        super();
    }

    // Popover account functions
    handleFunctionsOpen = ( event ) => {
        this.setState({
            anchorElement: event.currentTarget
        });
    }
    handleFunctionsClose = () => {
        this.setState({
            anchorElement: null
        });
    }

    // Dialog send transaction
    handleSendTxOpen = () => {
        this.setState({ sendTxOpen: true });
    }
    handleSendTxClose = ( shouldReload ) => {
        this.setState({ sendTxOpen: false });
        if( shouldReload ){
            this.loadAccountInfo();
        }
    }

    async loadAccountInfo(){
        let balance = await web3.eth.getBalance( this.props.auth.address );
        this.setState({ address: this.props.auth.address, balance: web3._extend.utils.fromWei( balance.toNumber() ) });
    }

    componentWillMount(){
        this.loadAccountInfo();
    }

    render() {
        const { anchorElement } = this.state;
        const open = Boolean( anchorElement );

        return (
            <div className="wallet">
                <Card className="account-area">
                    <Avatar 
                        className="account-avatar"
                        alt={this.state.address} >
                        <Identicon string={this.state.address} />
                    </Avatar>
                    <div className="account-info">
                        <h1>{this.state.address}</h1>
                        <p>{this.state.balance} CRP</p>
                    </div>
                    <div className="account-functions">
                        <IconButton onClick={this.handleFunctionsOpen} aria-label="functions"> <MoreVertIcon/> </IconButton>
                        <AccountFunctions
                            address={this.state.address}
                            anchorElement={anchorElement}
                            closeAction={this.handleFunctionsClose}
                        />

                    <IconButton disabled={this.state.balance <= 0} onClick={this.handleSendTxOpen} aria-label="functions"> <SendIcon/> </IconButton>
                </div>
                <Dialog open={this.state.sendTxOpen} onClose={this.handleSendTxClose}>
                    <SendTransaction 
                        address={this.state.address}
                        balance={this.state.balance}
                        closeAction={this.handleSendTxClose}
                    />
                </Dialog>
            </Card>
            <TransactionTable address={this.props.auth.address}/>
        </div>
        );
    }
}

function mapStateToProps( state ) {
    const { authentication } = state;
    const auth = authentication.auth;
    return {
        auth
    };
}
export default connect(mapStateToProps)(Wallet);
