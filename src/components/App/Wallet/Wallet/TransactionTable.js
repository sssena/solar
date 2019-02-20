import React, { Component } from 'react';

// react-table
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import ButtonBase from '@material-ui/core/ButtonBase';

//import 'react-bootstrap-table/css/react-bootstrap-table.css';
import './react-bootstrap-table-all.min.css';
// local components
import './TransactionTable.css';
import { web3 } from '../../../../web3';

/*
 * @author. sena
 * @comment. 'TransactionTable' shows a address info.
 */
class TransactionTable extends Component {
    state = {
        transactionList : []
    };

    constructor(){
        super();
    }

    handleTxInfoOpen = ( txHash ) => {
        console.log( txHash );
    }

    makeTxData( transactionList ){
        let data = [];
        for( var i = 0; i < transactionList.length; i++ ) {
            let tx = {
                no: i,
                hash: transactionList[i]
            };
            data.push( tx );
        } 
        this.setState({ transactionList: data });
    }

    async loadTransactionList(){
        let transactionList = await web3.eth_getAllTransactionList( this.props.address );
        this.makeTxData( transactionList );
    }

    componentWillMount(){
        this.loadTransactionList();
    }


    render() {
        function linkFormatter( cell, row ) {
            return ( <ButtonBase > {cell} </ButtonBase> );
        }

        return (
            <div className="transactions">
                <BootstrapTable
                    data={this.state.transactionList}>
                    <TableHeaderColumn dataField="no"> No. </TableHeaderColumn>
                    <TableHeaderColumn isKey dataField="hash" dataFormat={linkFormatter}> Tx Hash </TableHeaderColumn>
                </BootstrapTable>
            </div>
        );
    }
}

export default TransactionTable;
