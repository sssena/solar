import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// bootstrap
import Alert from 'react-bootstrap/Alert';

// material-ui components
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

// icon
import StartIcon from '@material-ui/icons/PlayCircleFilled';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import SaleIcon from '@material-ui/icons/MonetizationOn';

// local components
import './CrowdsaleView.css';
import { web3 } from '../../../../../web3';
import { contractHandlers } from '../../../../../helpers/contracts';
import { statusActions } from '../../../../../actions';

import ConfirmPassword from '../../../../common/ConfirmPassword';
import utils from '../../../../../helpers/utils';
import DateGraph from '../../../../common/DateGraph';
import JoinToCrowdsale from '../../../../common/JoinToCrowdsale';

/*
 * @author. sena
 * @comment. 'CrowdsaleView' shows a address info.
 */
class CrowdsaleView extends Component {
    state = {
        openDetail: false,
        openJoinToCrowdsale: false,
        openConfirmPassword: false,
        crowdsales: [],
        activateCrowdsale: {},
        page: 1
    };

    constructor(){
        super();
    }

    handleDetailOpen = ( index, event ) => {
        let crowdsale = this.state.crowdsales[index];
        let receiptPerSoftcap = (crowdsale.totalCrp / crowdsale.softcap).toFixed(2)  * 100 ;
        let receiptPerHardcap = 0;
        let remainAmount = crowdsale.softcap - crowdsale.totalCrp;

        // set progress bar
        if( receiptPerSoftcap > 100 ){
            receiptPerHardcap =((crowdsale.totalCrp - crowdsale.softcap) / (crowdsale.hardcap - crowdsale.softcap)).toFixed(2)  * 100 ;
            remainAmount = crowdsale.hardcap - crowdsale.totalCrp;
        }
        crowdsale.receiptPerSoftcap = receiptPerSoftcap;
        crowdsale.receiptPerHardcap = receiptPerHardcap;
        crowdsale.remainAmount = remainAmount;

        console.log( crowdsale )

        this.setState({ 
            openDetail: true,
            activateCrowdsale: crowdsale,
        });
    }

    handleChangePage = (event, page) => {
        this.setState({ page: page });
    }

    handleDetailClose = () => {
        this.setState({ openDetail: false });
    }

    handleJoinToCrowdsaleOpen = ( index ) => {
        this.setState({ openJoinToCrowdsale: true, activateCrowdsale: this.state.crowdsales[index] });
    }

    handleJoinToCrowdsaleClose = () => {
        this.setState({ openJoinToCrowdsale: false }, () => { this.loadData(); });
    }

    handleConfirmPasswordOpen = () => {
        this.setState({ openConfirmPassword: true });
    }

    handleConfirmPasswordClose = ( data ) => {
        this.setState({ 
            openConfirmPassword: false, 
            authorized: data.result, 
            passcode: data.passcode 
        }, () => { this.state.activateFunction(); });
    }

    handleHaltCrowdsale = ( index ) => {
        this.setState({ 
            openConfirmPassword: true, 
            activateCrowdsale: this.state.crowdsales[index], 
            activateFunction: this.haltCrowdsale.bind(this)
        });
    }

    handleStartCrowdsale = ( index ) => {
        this.setState({ 
            openConfirmPassword: true, 
            activateCrowdsale: this.state.crowdsales[index], 
            activateFunction: this.startCrowdsale.bind(this)
        });
    }

    async haltCrowdsale(){
        if( !this.state.authorized ){
            //TODO: Error. cannot get auth.
            return;
        }

        this.props.dispatch( statusActions.start() );

        let crowdsale = this.state.activateCrowdsale;
        if( crowdsale == null || crowdsale == undefined || crowdsale.address == '0x' || crowdsale.address == 0x0 ){
            alert("Invalid crowdsale.");
            return;
        }

        let params = {
            owner: {
                account: this.props.auth.address,
                password: this.state.passcode
            },
            address: this.state.contract.address,
            crowdsaleAddress: crowdsale.address
        }

        let data = null;
        try{
            data = await contractHandlers.haltCrowdsale( params );
        } catch( error ){
            console.error( error );
            data = { result: false };
        }

        this.props.dispatch( statusActions.done() );

        if( !data.result ){
            alert("Fail to halt crowdsale. Try agin.");
        } else if( !data.crowdsaleResult ){
            alert("Fail to crowdsale. The project has failed.");
        }

        this.props.reloadFunction(1);
    }

    async startCrowdsale(){
        if( !this.state.authorized ){
            //TODO: Error. cannot get auth.
            return;
        }

        this.props.dispatch( statusActions.start() );

        let crowdsale = this.state.activateCrowdsale;
        if( crowdsale == null || crowdsale == undefined || crowdsale.address == '0x' || crowdsale.address == 0x0 ){
            alert("Invalid crowdsale.");
            return;
        }

        let params = {
            owner: {
                account: this.props.auth.address,
                password: this.state.passcode
            },
            address: this.state.contract.address,
            crowdsaleAddress: crowdsale.address
        }

        let result = null;
        try{
            result = await contractHandlers.startCrowdsale( params );
        } catch( error ){
            console.error( error );
            result = false;
        }

        if( !result ){ alert("Fail to start crowdsale. Try agin."); }    

        this.props.dispatch( statusActions.done() );
        this.props.reloadFunction(1);
    }

    async loadData(){
        let contract = await contractHandlers.getMainContract( this.props.mainContractAddress );
        if( !contract ){
            this.setState({ isUndefined: true });
            return;
        }

        let onSale = false;
        let stage = await contract.stage().toString();
        let crowdsales = []; // it will be array

        // get main sale
        let crowdsaleContract = await contractHandlers.getFirstCrowdsaleContract( contract.address );
        if( crowdsaleContract == null ){
            // then, get first sale param 
            crowdsaleContract = contract.sale_param();

            crowdsales.push({
                address: undefined,
                totalCrp: 0,
                staffCrp: 0,
                ceiling: 0,
                own: 0,
                ownCrp: 0,
                startDate: crowdsaleContract[0].toNumber(),
                endDate: crowdsaleContract[1].toNumber(),
                foundRate: await web3._extend.utils.fromWei( crowdsaleContract[4].toNumber() ),
                softcap: await web3._extend.utils.fromWei( crowdsaleContract[2].toNumber() ),
                hardcap: await web3._extend.utils.fromWei( crowdsaleContract[3].toNumber() ),
                defaultRatio: crowdsaleContract[7].toNumber(),
                crpMin: crowdsaleContract[6].toNumber(),
                crpMax: crowdsaleContract[5].toNumber(),
                initWithdrawalAmount: await web3._extend.utils.fromWei( crowdsaleContract[8].toNumber() ),
                onSale: onSale
            });
        } else {
            if( stage == "2" 
                && crowdsaleContract.sale_info()[0].toNumber() < moment().unix() 
                && crowdsaleContract.sale_info()[1].toNumber() > moment().unix()
                && crowdsaleContract.total_CRP().toNumber() < crowdsaleContract.sale_info()[3] ){
                onSale = true;
            }

            let buyerInfo = await crowdsaleContract.sales( this.props.auth.address );
            crowdsales.push({
                address: crowdsaleContract.address,
                totalCrp: await web3._extend.utils.fromWei( crowdsaleContract.total_CRP().toNumber() ),
                staffCrp: await web3._extend.utils.fromWei( crowdsaleContract.total_staff_CRP().toNumber() ),
                ceiling: await web3._extend.utils.fromWei( crowdsaleContract.ceiling().toNumber() ),
                own: await web3._extend.utils.fromWei( buyerInfo[3].toNumber() ),
                ownCrp: await web3._extend.utils.fromWei( buyerInfo[2].toNumber() ),
                startDate: crowdsaleContract.sale_info()[0].toNumber(),
                endDate: crowdsaleContract.sale_info()[1].toNumber(),
                softcap: await web3._extend.utils.fromWei( crowdsaleContract.sale_info()[2].toNumber() ),
                hardcap: await web3._extend.utils.fromWei( crowdsaleContract.sale_info()[3].toNumber() ),
                foundRate: await web3._extend.utils.fromWei( crowdsaleContract.sale_info()[4].toNumber() ),
                crpMin: await web3._extend.utils.fromWei( crowdsaleContract.sale_info()[6].toNumber() ),
                crpMax: await web3._extend.utils.fromWei( crowdsaleContract.sale_info()[5].toNumber() ),
                defaultRatio: crowdsaleContract.sale_info()[7].toNumber(),
                initWithdrawalAmount: await web3._extend.utils.fromWei( crowdsaleContract.sale_info()[8].toNumber() ),
                onSale: onSale
            });
        }

        this.setState({ 
            contract: contract,
            crowdsales: crowdsales,
            symbol: await contract.token_param()[1]
        });
    }
    
    componentWillMount(){
        this.loadData();
    }

    render() {
        if( this.state.isUndefined ) { return null; }
        return (
            <div className="detail-crowdsale">
                <div className="crowdsale-list">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell> Date </TableCell>
                                <TableCell> Own </TableCell>
                                <TableCell> Softcap </TableCell>
                                <TableCell> Address </TableCell>
                                <TableCell> Functions </TableCell>
                            </TableRow>
                        </TableHead>
                        { 
                            this.state.crowdsales.map((item, index) => {
                                return (
                                    <TableBody key={index}>
                                        <TableRow>
                                            <TableCell align="center"> 
                                                {moment.unix( item.startDate ).format('lll')} ~ {moment.unix( item.endDate ).format('lll')} 
                                            </TableCell>
                                            <TableCell> 
                                                {item.own} {this.state.symbol} <span className="substr">(= {item.ownCrp} CRP)</span> 
                                            </TableCell>
                                            <TableCell> {item.softcap} CRP </TableCell>
                                            <TableCell align="center">
                                                <a href="#" onClick={this.handleDetailOpen.bind(this, index)}>
                                                    <span>{item.address == undefined ? 'Not deployed' : item.address}</span>
                                                </a>
                                            </TableCell>
                                            <TableCell align="center"> 
                                                {
                                                    (this.state.contract.stage() != "4" && item.onSale ) ? (
                                                        <IconButton onClick={this.handleJoinToCrowdsaleOpen.bind(this, index)}> <SaleIcon/> </IconButton> 
                                                    ) : (
                                                        <IconButton disabled={true}> <SaleIcon/> </IconButton> 
                                                    )
                                                }
                                                {
                                                    (this.state.contract.stage() == "1" && this.state.contract.owner() == this.props.auth.address && item.startDate < moment().unix()) ? (
                                                        <IconButton onClick={this.handleStartCrowdsale.bind(this, index)}> <StartIcon/> </IconButton> 
                                                    ) : null
                                                }
                                                {
                                                    (this.state.contract.stage() == "2" && this.state.contract.owner() == this.props.auth.address && item.endDate < moment().unix()) ? (
                                                        <IconButton onClick={this.handleHaltCrowdsale.bind(this, index)}> <StopIcon/> </IconButton> 
                                                    ) : null
                                                }
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                );
                            }) 
                        }
                    </Table>
                    <Dialog
                        fullWidth={true}
                        maxWidth="sm"
                        open={this.state.openDetail}
                        onClose={this.handleDetailClose}>
                        <DialogTitle id="alert-dialog-title">Crowdsale Detail<p className="label">{this.state.activateCrowdsale.address}</p></DialogTitle>
                        <DialogContent>
                            <div className="crowdsale-detail-contents">
                                <DateGraph startDate={this.state.activateCrowdsale.startDate} endDate={this.state.activateCrowdsale.endDate}/>
                                <div className="crowdsale-detail-info">
                                    <div className="token-info">
                                        <h3>{this.state.symbol}</h3>
                                        <span className="exchange-ratio"> 1 CRP: {this.state.activateCrowdsale.defaultRatio} {this.state.symbol} </span>
                                    </div>
                                    <div className="fund-info">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td className="label">Goal: </td>
                                                    <td className="value">{this.state.activateCrowdsale.softcap} <span> CRP</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="label">Current: </td>
                                                    <td className="value">{this.state.activateCrowdsale.totalCrp} <span> CRP</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="label">Limit: </td>
                                                    <td className="value">{this.state.activateCrowdsale.hardcap} <span> CRP</span></td>
                                                </tr>
                                                {
                                                    this.state.activateCrowdsale.own > 0 ? (
                                                        <>
                                                        <tr></tr>
                                                        <tr>
                                                            <td className="label">Yours: </td>
                                                            <td className="value">{this.state.activateCrowdsale.ownCrp} <span> CRP</span></td>
                                                        </tr>
                                                        </>
                                                    ): <></>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="goal-info">
                                    <Tooltip title={this.state.activateCrowdsale.totalCrp + "/" + this.state.activateCrowdsale.softcap} aria-label="Add" placement="top">
                                        <LinearProgress
                                            id="softcap-achieve"
                                            color={this.state.activateCrowdsale.receiptPerSoftcap >= 100 ? "secondary" : "primary"}
                                            variant="determinate"
                                            value={this.state.activateCrowdsale.receiptPerSoftcap}
                                            valueBuffer={0}
                                            className="crowdsale-funding-bar"/>
                                    </Tooltip>
                                    <Tooltip title={this.state.activateCrowdsale.totalCrp + "/" + this.state.activateCrowdsale.hardcap} aria-label="Add" placement="top">
                                    <LinearProgress
                                            id="hardcap-achieve"
                                            variant="buffer"
                                            valueBuffer={0}
                                            value={this.state.activateCrowdsale.receiptPerHardcap}
                                            className="crowdsale-funding-bar"/>
                                    </Tooltip>
                                    <div className="goal-text">
                                        <span>{this.state.activateCrowdsale.totalCrp} CRP of {this.state.activateCrowdsale.softcap} CRP goal</span>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleDetailClose} color="primary" autoFocus> Close </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog
                        open={this.state.openJoinToCrowdsale}
                        onClose={this.handleJoinToCrowdsaleClose} >
                        <JoinToCrowdsale
                            main={this.state.contract}
                            crowdsale={this.state.activateCrowdsale}
                            closeAction={this.handleJoinToCrowdsaleClose} />
                    </Dialog>
                    <Dialog
                        open={this.state.openConfirmPassword}
                        onClose={this.handleConfirmPasswordClose} >
                        <ConfirmPassword
                            useUnlock={true}
                            closeAction={this.handleConfirmPasswordClose} />
                    </Dialog>
                </div>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(CrowdsaleView);
