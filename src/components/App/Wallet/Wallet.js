import React, { Component } from 'react';
import Identicon from 'react-identicons';

// material-ui components
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import ButtonBase from '@material-ui/core/ButtonBase';
import Snackbars from '@material-ui/core/Snackbar';

// local components
import './Wallet.css';
import { web3 } from '../../../web3';
import Account from '../../common/Account';
import TransactionTable from './TransactionTable';

/*
 * @author. sena
 * @comment. 'Wallet' shows a address info.
 */
class Wallet extends Component {
    state = {
        address: '',
        balance: 0,
        unit: 'CRP'
    };

    constructor(){
        super();
    }

    copyToClipboard() {
        const {clipboard} = require('electron');
        clipboard.writeText( this.state.address );
    }

    setLabel() {
        console.log("set a label");
    }   

    createQRCode() {
        console.log("create QR Code");
    }

    async loadAccountInfo(){
        let balance = await web3.eth_getBalance( this.props.address );
        this.setState({ address: this.props.address, balance: balance });
    }

    componentWillMount(){
        this.loadAccountInfo();
    }

    render() {
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
                        <p>{this.state.balance} {this.state.unit}</p>
                    </div>
                    <div className="account-functions">
                        <ButtonBase> <img className="function-icon" onClick={this.copyToClipboard} alt="copy to clipboard" src="../icons/clipboard.png"/> </ButtonBase> 
                        <ButtonBase> <img className="function-icon" onClick={this.setLabel} alt="set a label" src="../icons/label.png"/> </ButtonBase>
                        <ButtonBase> <img className="function-icon" onClick={this.createQRCode} alt="copy from qr-code" src="../icons/qr-code.png"/> </ButtonBase>
                    </div>
                </Card>
                <TransactionTable address={this.props.address}/>
            </div>
        );
    }
}

export default Wallet;
