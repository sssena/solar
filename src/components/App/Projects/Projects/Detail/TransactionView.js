import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import moment from 'moment';

// material-ui components
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

// local components
import './TransactionView.css';
import { web3 } from '../../../../../web3';
import { history } from '../../../../../helpers/history';
import { contractHandlers } from '../../../../../helpers/contracts';
import DateGraph from '../../../../common/DateGraph';
import { statusActions } from '../../../../../actions';
import Transaction from '../../../../common/Transaction';

/*
 * @author. sena
 * @comment. 'TransactionView' shows a address info.
 */
class TransactionView extends Component {
    state = {
        openTxInfo: false,
        transactions: []
    };

    constructor(){
        super();

        this.handleTxInfoClose = this.handleTxInfoClose.bind(this);
    }

    handleTxInfoOpen = ( hash ) => {
        this.setState({ openTxInfo: true, activeHash: hash });
    }

    handleTxInfoClose = () => {
        this.setState({ openTxInfo: false });
    }

    async loadData(){
        let contract = await contractHandlers.getMainContract( this.props.mainContractAddress );
        if( contract == null || contract == undefined || contract.address == 0x0 || contract.address == '0x'){
            this.setState({ isUndefined: true });
            return;
        }

        let crowdsaleContract = await contractHandlers.getFirstCrowdsaleContract( contract.address );
        if( crowdsaleContract == null ){
            return;
        }

        let transactions = [];
        let response = await axios({
            method: 'POST',
            dataType: 'json',
            url: 'http://localhost:3000/addr/crowd',
            data: {
                ca: crowdsaleContract.address,
                addr: this.props.auth.address
            }
        }).catch( (error) => {
            console.error(error);
            response.data = {
                data: []
            }
        });

        let hashes = response.data.data;
        for( var hash of hashes ){
            let transaction = await web3.eth.getTransaction( hash[0] );
            let block = await web3.eth.getBlock( transaction.blockNumber );

            transactions.push({
                hash: transaction.hash,
                blockNumber: transaction.blockNumber,
                from: transaction.from,
                to: transaction.to,
                timestamp: moment.unix(block.timestamp).format('lll'),
                value: await web3._extend.utils.fromWei( transaction.value.toNumber() )
            });
        }
        this.setState({ transactions: transactions });
    }

    async componentWillMount(){
        await this.loadData();
    }

    render() {
        if( this.state.isUndefined ){ return null; }
        return (
            <div className="detail-tranasations">
                <Table className="transaction-table">
                    <TableHead>
                        <TableRow>
                            <TableCell> Transaction Hash </TableCell>
                            <TableCell> Block </TableCell>
                            <TableCell> Timestamp </TableCell>
                            <TableCell> From </TableCell>
                            <TableCell> To </TableCell>
                            <TableCell> Amount </TableCell>
                        </TableRow>
                    </TableHead>
                    {
                        this.state.transactions.length == 0 ? (
                            <TableBody><TableRow><TableCell align="center" colSpan={6}> There is no transaction. </TableCell></TableRow></TableBody>
                        ) : null
                    }
                    {
                        this.state.transactions.map((item, index) => {
                            return (
                                <TableBody key={index}>
                                    <TableRow>
                                        <TableCell className="tx-list" align="center">
                                            <a href="#" onClick={this.handleTxInfoOpen.bind(this, item.hash)}>{item.hash}</a>
                                        </TableCell>
                                        <TableCell className="tx-list"> {item.blockNumber} </TableCell>
                                        <TableCell className="tx-list timestamp"> {item.timestamp} </TableCell>
                                        <TableCell className="tx-list"> {item.from} </TableCell>
                                        <TableCell className="tx-list"> {item.to} </TableCell>
                                        <TableCell className="tx-list"> {item.value} </TableCell>
                                    </TableRow>
                                </TableBody>
                            );
                        })
                    }
                </Table>
                <Dialog
                    maxWidth={false}
                    open={this.state.openTxInfo}
                    onClose={this.handleTxInfoClose} >
                    <Transaction closeAction={this.handleTxInfoClose} hash={this.state.activeHash} />
                </Dialog>


            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(TransactionView);
