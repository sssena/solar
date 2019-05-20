import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// material-ui components
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';

// icons
import SendTokenIcon from '@material-ui/icons/Send';
import SaleIcon from '@material-ui/icons/MonetizationOn';
import FavoriteBorder from '@material-ui/icons/StarBorder';
import FavoriteIcon from '@material-ui/icons/Star';

// local components
//import './ProjectList.css';
import { web3 } from '../../web3';
import { history } from '../../helpers/history';
import { contractHandlers } from '../../helpers/contracts';
import { storageHandlers } from '../../helpers/storage';
import { getStageLabel } from './Labels';
import ConfirmPassword from './ConfirmPassword';
import TokenTransfer from './TokenTransfer';
import JoinToCrowdsale from './JoinToCrowdsale';
import utils from '../../helpers/utils';

/*
 * @author. sena
 * @comment. 'ProjectList' project list table and functions.
 */
class ProjectList extends Component {
    state = {
        activateCrowdsale: undefined,
        activateMainAddress: undefined,
        openTokenTransfer: false,
        openJoinToCrowdsale: false
    };

    constructor(){
        super();
    }

    // token transfer
    handleTokenTransferOpen = async ( address ) => {
        let tokenContract = await contractHandlers.getTokenContract( address );
        this.setState({ openTokenTransfer: true, activateTokenContract: tokenContract });
    }

    handleTokenTransferClose = () => {
        this.setState({ openTokenTransfer: false });
    }

    // join to crowdsale
    handleJoinToCrowdsaleOpen = async ( address ) => {
        let contract = await contractHandlers.getMainContract( address );
        if( contract == null || contract.address == 0x0 || contract.address == '0x' ){
            // invalid main contract.
            return;
        }

        let crowdsale = await contractHandlers.getFirstCrowdsaleContract( address );
        if( crowdsale == null ){
            // invalid crowdsale contract.
            return;
        }

        crowdsale.crpMin = await web3._extend.utils.fromWei( crowdsale.sale_info()[6].toNumber() );
        crowdsale.crpMax = await web3._extend.utils.fromWei( crowdsale.sale_info()[5].toNumber() );

        this.setState({ openJoinToCrowdsale: true, activateCrowdsale: crowdsale, activateMainAddress: address });
    }

    handleJoinToCrowdsaleClose = () => {
        this.setState({ openJoinToCrowdsale: false });
    }

    handleFavoriteToggle = ( index ) => async ( event ) => {
        let projectList = this.props.projects;
        if( projectList[index].favorite ) {
            await storageHandlers.remove( this.props.auth.address, projectList[index].address );
        } else {
            await storageHandlers.add( this.props.auth.address, projectList[index].address );
        }
        this.props.reloadFunction();
    }

    goToDetailView( address ){
        history.push('/projects/detail/' + address);
    }

    render() {
        return (
            <div className="projects">
                <Paper className="project-list-ara">
                    <Table className="project-list">
                        <TableHead>
                            <TableRow>
                                <TableCell> Title </TableCell>
                                <TableCell> Address </TableCell>
                                <TableCell> Stage </TableCell>
                                <TableCell> Symbol </TableCell>
                                <TableCell> Token Amount </TableCell>
                                <TableCell> Functions </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.props.projects.map( ( item, index ) => (
                                    <TableRow key={item.address}>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell component="th" scope="row">
                                            <a href="#" onClick={this.goToDetailView.bind(this, item.address)}>{item.address}</a>
                                        </TableCell>
                                        <TableCell align="center"> {item.stage} </TableCell>
                                        <TableCell> {item.symbol} </TableCell>
                                        <TableCell> {item.hasAmount} {item.symbol} </TableCell>
                                        <TableCell>
                                            <IconButton disabled={!(item.canSend)} onClick={this.handleTokenTransferOpen.bind(this,item.address)}>
                                                <SendTokenIcon fontSize="small"/>
                                            </IconButton>
                                            <IconButton disabled={!(item.crowdsale.onSale)} onClick={this.handleJoinToCrowdsaleOpen.bind(this, item.address)}>
                                                <SaleIcon fontSize="small"/>
                                            </IconButton>
                                            <Checkbox 
                                                icon={<FavoriteBorder/>} 
                                                checked={item.favorite}
                                                checkedIcon={<FavoriteIcon/>} 
                                                onChange={this.handleFavoriteToggle(index)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </Paper>

                <Dialog
                    open={this.state.openJoinToCrowdsale}
                    onClose={this.handleJoinToCrowdsaleClose} >
                    <JoinToCrowdsale
                        mainAddress={this.state.activateMainAddress}
                        crowdsale={this.state.activateCrowdsale}
                        closeAction={this.handleJoinToCrowdsaleClose} />
                </Dialog>

                <Dialog
                    open={this.state.openTokenTransfer}
                    onClose={this.handleTokenTransferClose} >
                    <TokenTransfer
                        tokenContract={this.state.activateTokenContract}
                        closeAction={this.handleTokenTransferClose} />
                </Dialog>
            </div>
        );
    }
}
function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(ProjectList);
