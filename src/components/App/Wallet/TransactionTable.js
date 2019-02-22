import React, { Component } from 'react';

// material-ui components 
import Dialog from '@material-ui/core/Dialog';

// react-bootstrap-table
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';

// react-bootstrap-table css
import 'bootstrap/dist/css/bootstrap.min.css'; // react-bootstrap-table needs bootstrap.
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

// local components
import './TransactionTable.css';
import { web3 } from '../../../web3';
import Transaction from './Transaction';

/*
 * @author. sena
 * @comment. 'TransactionTable' shows a address info.
 */
class TransactionTable extends Component {
    state = {
        transactions : [],
        openTxInfo: false,
        activateHash: ''
    };

    constructor(){
        super();
    }

    handleTxInfoOpen = ( hash ) => {
        this.setState({ openTxInfo: true, activateHash: hash });
    }
    handleTxInfoClose = () => {
        this.setState({ openTxInfo: false, activatehash: '' })
    }

    async loadTransactions(){
        let transactions = [];
        let hashs = await web3.eth_getAllTransactionList( this.props.address );

        for await ( let hash of hashs ) {
            let info = await web3.eth_getTransaction( hash );
            transactions.push({ 
                hash: info.hash,
                blockNumber: info.blockNumber,
                from: info.from,
                to: info.to,
                value: info.value.toString()
            });
        }
        this.setState({ transactions: transactions });
    }

    componentWillMount(){
        this.loadTransactions();
    }

    render() {
        const columns = [{
            dataField: 'hash',
            text: 'Transaction Hash',
            classes: 'transaction-table-column'
        },{
            dataField: 'blockNumber',
            text: 'Block',
            classes: 'transaction-table-column',
            headerClasses: 'transaction-table-header-number'
        },{
            dataField: 'from',
            text: 'From',
            classes: 'transaction-table-column'
        },{
            text: '', // To write '->' between from and to columns
            formatter: iconFormatter,
            dataField: '',
            classes: 'transaction-table-column',
            headerClasses: 'transaction-table-header-small'
        },{
            dataField: 'to',
            text: 'To',
            classes: 'transaction-table-column'
        },{
            dataField: 'value',
            text: 'Value',
            classes: 'transaction-table-column',
            headerClasses: 'transaction-table-header-number'
        }];

        const rowEvents = {
            onClick: (e, row, rowIndex ) => {
                this.handleTxInfoOpen( row.hash );
            }
        };

        const pagingOptions = {
            hideSizePerPage: true
        }

        function iconFormatter( cell, row ) { return (<img className="icon-small" src="public/imgs/next.png" />); }

        return (
            <div className="transactions">
                <BootstrapTable 
                    bordered={false}
                    keyField="hash"
                    data={this.state.transactions}
                    columns={columns}
                    headerClasses="transaction-table-header"
                    rowEvents={rowEvents}
                    pagination={ paginationFactory( pagingOptions ) }
                />

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
