import React, { Component } from 'react';
import path from 'path';
import axios from 'axios';

// material-ui components 
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

//icons
import RefreshIcon from '@material-ui/icons/Refresh';

// local components
import './TransactionTable.css';
import { web3 } from '../../../web3';
import Transaction from '../../common/Transaction';

/*
 * @author. sena
 * @comment. 'TransactionTable' shows a address info.
 */
class TransactionTable extends Component {
    state = {
        transactions : [],
        openTxInfo: false,
        activateHash: '',
        page: 1
    };

    constructor(){
        super();

        this.loadTransactions = this.loadTransactions.bind(this);
    }

    handleTxInfoOpen = ( hash ) => {
        this.setState({ openTxInfo: true, activateHash: hash });
    }
    handleTxInfoClose = () => {
        this.setState({ openTxInfo: false, activatehash: '' })
    }

    handleChangePage = ( event, page ) => {
        this.setState({ page });
    }

    async loadTransactions(){
        let transactions = [];
        let response = await axios({
            method: 'POST',
            dataType: 'json',
            url: 'http://localhost:3000/addr/crp',
            data: {
                addr: this.props.address
            }
        }).catch( (error) => { 
            console.error(error);
            response.data = {
                data: []
            }
        });

        for( var data of response.data.data ){
            let transaction = await web3.eth.getTransaction( data[0] );
            if( transaction == null ) continue;
            transactions.push({
                id: transaction.hash,
                hash: transaction.hash,
                blockNumber: transaction.blockNumber,
                from: transaction.from,
                to: transaction.to,
                value: web3._extend.utils.fromWei(transaction.value.toString())
            });
        }
        this.setState({ transactions: transactions });
    }

    async componentWillMount(){
        await this.loadTransactions();
    }

    render() {
        return (
            <div className="transactions">
                <Table className="transaction-table">
                    <TableHead>
                        <TableRow>
                            <TableCell className="table-cell-medium"> Transaction Hash </TableCell>
                            <TableCell className="table-cell-small"> Block </TableCell>
                            <TableCell className="table-cell-medium"> From </TableCell>
                            <TableCell>  </TableCell>
                            <TableCell className="table-cell-medium"> To </TableCell>
                            <TableCell className="table-cell-small"> Value </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        this.state.transactions.slice( this.state.page * 10, this.state.page * 10 + 10 ).map((item, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell className="transaction-table-td" align="center">
                                        <a href="#" onClick={this.handleTxInfoOpen.bind(this, item.hash)}>{item.hash}</a>
                                    </TableCell>
                                    <TableCell className="transaction-table-td">{item.blockNumber}</TableCell>
                                    <TableCell className="transaction-table-td">{item.from}</TableCell>
                                    <TableCell className="transaction-table-td" align="center">
                                        <img className="icon-xsmall" src={path.join(__dirname, '../public/imgs/next.png')}/>
                                    </TableCell>
                                    <TableCell className="transaction-table-td">{item.to}</TableCell>
                                    <TableCell className="transaction-table-td" align="right">{item.value} CRP</TableCell>
                                </TableRow>
                            );
                        })
                    }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[10]}
                                colSpan={3}
                                count={this.state.transactions.length}
                                rowsPerPage={10}
                                page={this.state.page}
                                onChangePage={this.handleChangePage}
                            />
                            <TableCell>
                                <IconButton onClick={this.loadTransactions} aria-label="reload"> <RefreshIcon fontSize="small"/> </IconButton>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                <Dialog
                    maxWidth={false}
                    open={this.state.openTxInfo}
                    onClose={this.handleTxInfoClose} >
                    <Transaction closeAction={this.handleTxInfoClose} hash={this.state.activateHash} />
                </Dialog>
            </div>
        );
    }
}

export default TransactionTable;
