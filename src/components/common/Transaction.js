import React, { Component } from 'react';
import path from 'path';
import moment from 'moment';

// material-ui components 
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Divider from '@material-ui/core/Divider';

// icons
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import BlockIcon from '@material-ui/icons/Block';

// local components
import './Transaction.css';
import { web3 } from '../../web3';
import { SuccessLabel, FailLabel } from './Labels';

/*
 * @author. sena
 * @comment. 'TransactionTable' shows a address info.
 */
class Transaction extends Component {
    state = {
        showmore: false
    };

    toggleShowmore = () => {
        this.setState({ showmore: !this.state.showmore });
    }

    constructor(){
        super();
    }

    async loadTransaction(){
        let transaction = await web3.eth.getTransaction( this.props.hash );
        let transactionReceipt = await web3.eth.getTransactionReceipt( this.props.hash );
        let block = await web3.eth.getBlock( transaction.blockNumber );

        this.setState({
            hash: transaction.hash,
            index: transactionReceipt.transactionIndex,
            blockHash: transaction.blockHash,
            blockNumber: transaction.blockNumber,
            timestamp: moment.unix(block.timestamp).format('lll'),
            from: transaction.from,
            to: transaction.to,
            gas: transaction.gas,
            gasUsed: transactionReceipt.gasUsed,
            gasPrice: transaction.gasPrice.toString(),
            contractAddress: transactionReceipt.contractAddress,
            //input: transaction.input,
            nonce: transaction.nonce,
            transationIndex: transaction.transationIndex,
            value: web3._extend.utils.fromWei(transaction.value.toString()),
            status: transactionReceipt.status 
        });
    }

    componentWillMount(){
        this.loadTransaction();
    }

    render() {
        return (
            <div className="transaction">
                <h2> Transaction Detail </h2>
                <Divider className="transaction-divider"/>
                <table className="transaction-info">
                    <tbody>
                        <tr>
                            <td className="transaction-info-header"> Hash </td>
                            <td className="transaction-info-value hash"> {this.state.hash} </td>
                        </tr>
                        <tr>
                            <td className="transaction-info-header"> Status </td>
                            <td className="transaction-info-value"> 
                                <div className="transaction-status">
                                    { this.state.status ? (<SuccessLabel />) : (<FailLabel />)}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="transaction-info-header"> Block </td>
                            <td className="transaction-info-value">
                                {this.state.blockNumber} 
                            </td>
                        </tr>
                        <tr>
                            <td className="transaction-info-header">  </td>
                            <td className="transaction-info-value hash">
                                {this.state.blockHash} 
                            </td>
                        </tr>
                        <tr>
                            <td className="transaction-info-header"> Timestamp </td>
                            <td className="transaction-info-value">
                                {this.state.timestamp} 
                            </td>
                        </tr>
                        <tr>
                            <td className="transaction-info-header"> Transfer </td>
                            <td className="transaction-info-value hash"> 
                                {this.state.from} 
                            </td>
                        </tr>
                        <tr>
                            <td className="transaction-info-header">  </td>
                            <td className="transaction-info-value hash"> 
                                <img className="icon-xsmall" src={path.join(__dirname, '../public/imgs/next.png')} /> {this.state.to} 
                            </td>
                        </tr>
                        <tr>
                            <td className="transaction-info-header"> Value </td>
                            <td className="transaction-info-value"> {this.state.value} CRP </td>
                        </tr>
                        <tr> 
                            <td className="transaction-info-clickable">
                                <ButtonBase onClick={this.toggleShowmore}> {this.state.showmore ? "Show less" : "Show more" } </ButtonBase>
                            </td>
                        </tr>
                        <tr className={this.state.showmore ? "transaction-info-show" : "transaction-info-hide"}>
                            <td className="transaction-info-header"> Gas Limit </td>
                            <td className="transaction-info-value"> {this.state.gas} Wei </td>
                        </tr>
                        <tr className={this.state.showmore ? "transaction-info-show" : "transaction-info-hide"}>
                            <td className="transaction-info-header"> Gas Used </td>
                            <td className="transaction-info-value"> {this.state.gasUsed} Wei </td>
                        </tr>
                        <tr className={this.state.showmore ? "transaction-info-show" : "transaction-info-hide"}>
                            <td className="transaction-info-header"> Gas Price </td>
                            <td className="transaction-info-value"> {this.state.gasPrice} Wei </td>
                        </tr>
                    </tbody>
                </table>
                <div className="transaction-info-close-div">
                    <Button size="small" color="primary" className="transaction-info-close" onClick={this.props.closeAction}>Close</Button>
                </div>
            </div>
        );
    }
}

export default Transaction;
