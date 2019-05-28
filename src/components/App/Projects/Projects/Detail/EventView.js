import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// bootstrap components
import Alert from 'react-bootstrap/Alert';

// material-ui components
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

// icon
import AddIcon from '@material-ui/icons/PlaylistAdd';
import StopIcon from '@material-ui/icons/PauseCircleFilled';

// local components
import './EventView.css';
import { web3 } from '../../../../../web3';
import { contractHandlers } from '../../../../../helpers/contracts';
import { statusActions } from '../../../../../actions';
import DateGraph from '../../../../common/DateGraph';
import ConfirmPassword from '../../../../common/ConfirmPassword';

import DetailWithdrawPoll from './EventView/DetailWithdrawPoll';
import DetailCrowdsalePoll from './EventView/DetailCrowdsalePoll';
import AddWithdrawPoll from './EventView/AddWithdrawPoll';
import AddCrowdsalePoll from './EventView/AddCrowdsalePoll';
// import AddRefundPoll from './EventView/AddRefundPoll';

function hasOngoingPoll( polls ){
    for( let poll of polls ){
        if( poll.isEnded == false ) return true;
    }
    return false;
}

/*
 * @author. sena
 * @comment. 'EventView' shows a address info.
 */
class EventView extends Component {
    state = {
        openDetail: false,
        openCreateForm: false,
        openConfirmPassword: false,
        events: [],
        activePoll: {},
        type: ''
    };

    constructor(){
        super();

        this.handleDetailOpen = this.handleDetailOpen.bind(this);
        this.handleDetailClose = this.handleDetailClose.bind(this);
        this.handleCreateFormClose = this.handleCreateFormClose.bind(this);
        this.handleConfirmPasswordOpen = this.handleConfirmPasswordOpen.bind(this);
        this.handleConfirmPasswordClose = this.handleConfirmPasswordClose.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleAddPoll = this.handleAddPoll.bind(this);
        this.handleHaltPoll = this.handleHaltPoll.bind(this);
    }

    handleDetailOpen = async ( index, event ) => {
        this.setState({ activePoll: this.state.events[index], openDetail: true });
    }

    handleDetailClose = () => {
        this.setState({ openDetail: false });
    }

    handleCreateFormClose = () => {
        this.setState({ openCreateForm: false, type: '' }, () => { this.loadData(); } );
    }

    handleConfirmPasswordOpen = () => {
        this.setState({ openConfirmPassword: true });
    }

    handleConfirmPasswordClose = ( data ) => {
        this.setState({ openConfirmPassword: false, authorized: data.result, passcode: data.passcode }, () => { this.state.activateFunction(); });
    }

    handleTypeChange = ( event ) => {
        this.setState({
            type: event.target.value
        });
    }

    handleAddPoll = () => {
        let type = this.state.type;
        if( type != "withdraw" && type != "crowdsale" && type != "refund" ){ return; }

        this.setState({
            openCreateForm : true,
            type: type
        });
    }

    handleHaltPoll = ( index ) => {
        this.setState({
            openConfirmPassword: true,
            activatePoll: this.state.events[index],
            activateFunction: this.haltPoll.bind(this)
        });
    }

    async haltPoll(){
        if( !this.state.authorized ) { return ; }
        this.props.dispatch( statusActions.start() );
        let type = '';
        if( this.state.activatePoll.type == "Additional Withdraw" ){
            type = "withdraw";
        } else if ( this.state.activatePoll.type == "Additional Crowdsale" ){
            type = "crowdsale";
        } else if ( this.state.actiavePoll.type == "Refund" ){
            type = "refund";
        }
        let params = {
            type: type,
            address: this.props.mainContractAddress,
            owner:{
                account: this.props.auth.address,
                password: this.state.passcode
            },
            pollAddress: this.state.activatePoll.address
        };
        let result =  await contractHandlers.haltPoll( params )
            .catch(( error ) => {
                console.error( error );
                result = false;
            });
        if( !result ){
            alert("Fail to halt poll.");
        }

        this.loadData();
        this.props.dispatch( statusActions.done() );
    }

    async loadData(){
        let contract = await contractHandlers.getMainContract( this.props.mainContractAddress );
        if( !contract ){ //TODO: Exception
            return;
        }

        // additional withdraw poll list
        let withdrawPolls = await contractHandlers.getWithdrawPolls( this.props.mainContractAddress );
        let crowdsalePolls = await contractHandlers.getCrowdsalePolls( this.props.mainContractAddress );
        let refundPolls = await contractHandlers.getRefundPolls( this.props.mainContractAddress );

        // if not ended .. 
        let isNotEnded = {
            withdraw: await hasOngoingPoll( withdrawPolls ),
            crowdsale: await hasOngoingPoll( crowdsalePolls ),
            refund: await hasOngoingPoll( refundPolls )
        };

        //check account has stake : for refund poll
        let hasStake = false;
        let tokenContract = await contractHandlers.getTokenContract( this.props.mainContractAddress );
        if( tokenContract != null && tokenContract != undefined ){
            hasStake = ( tokenContract.activeOf( this.props.auth.address ) > 0 ) ? true : false ;
        }

        // list
        let events = [];
        for( var poll of withdrawPolls ){
            let state = 'Unknown';
            let startDate = moment.unix( poll.poll_started() );
            let endDate = moment.unix( poll.poll_ended() );
            let today = moment();

            if( startDate.isAfter( today ) ){
                state = "Not started yet";
            } else if ( today.isAfter( startDate ) && today.isAfter( endDate ) ){
                state = "Has ended";
            } else if ( today.isAfter( startDate ) && today.isBefore( endDate ) ){
                state = "On polling";
            }

            events.push({
                type: "Additional Withdraw",
                address: poll.address,
                startDate: poll.poll_started(),
                endDate: poll.poll_ended(),
                isEnded: poll.isEnded,
                isSettled: poll.isSettled,
                state: state,
            });
        }

        for( var poll of crowdsalePolls ){
            let state = 'Unknown';
            let startDate = moment.unix( poll.poll_started() );
            let endDate = moment.unix( poll.poll_ended() );
            let today = moment();

            if( startDate.isAfter( today ) ){
                state = "Not started yet";
            } else if ( today.isAfter( startDate ) && today.isAfter( endDate ) ){
                state = "Has ended";
            } else if ( today.isAfter( startDate ) && today.isBefore( endDate ) ){
                state = "On polling";
            }

            events.push({
                type: "Additional Crowdsale",
                address: poll.address,
                startDate: poll.poll_started(),
                endDate: poll.poll_ended(),
                isEnded: poll.isEnded,
                isSettled: poll.isSettled,
                state: state
            });
        }

        // set state
        this.setState({
            owner: await contract.owner(),
            stage: await contract.stage().toString(),
            events: events,
            hasStake: hasStake,
            isNotEnded: isNotEnded
        }, () => { console.log( this.state )});
    }
    
    componentWillMount(){
        this.loadData();
    }

    render() {
        let selectList = [];
        if( this.state.stage == "3" ){ // on proceeding
            if( this.state.owner == this.props.auth.address ){
                selectList = [
                    { value: 'withdraw', label: 'Additional Withdraw', disabled: this.state.isNotEnded.withdraw },
                    { value: 'crowdsale', label: 'Additional Crowdsale', disabled: this.state.isNotEnded.crowdsale }
                ];
            } else if ( this.state.hasStake ){
                selectList = [
                    { value: 'refund', label: 'Refund', disabled: this.state.isNotEnded.refund }
                ];
            } 
        }

        return (
            <div className="detail-events">
                <div className="event-functions">
                    <FormControl className="select-event-type">
                        <InputLabel htmlFor="event-type">Event type</InputLabel>
                        <Select
                            disabled={selectList.length == 0}
                            value={this.state.type}
                            onChange={this.handleTypeChange}
                            inputProps={{ id: 'event-type', }}>
                            {
                                selectList.map( (item) => {
                                    return(
                                        <MenuItem disabled={item.disabled} key={item.label} value={item.value}>{item.label}</MenuItem>
                                    );
                                })
                            }
                        </Select>
                    </FormControl>
                    <IconButton disabled={(selectList.length == 0)} onClick={this.handleAddPoll}><AddIcon/></IconButton>
                </div>
                <div className="event-list">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell> Type </TableCell>
                                <TableCell> Date </TableCell>
                                <TableCell> Address </TableCell>
                                <TableCell> State </TableCell>
                                <TableCell> Functions </TableCell>
                            </TableRow>
                        </TableHead>
                        { 
                            this.state.events.map((item, index) => {
                                return (
                                    <TableBody key={index}>
                                        <TableRow>
                                            <TableCell> {item.type} </TableCell>
                                            <TableCell> 
                                                {moment.unix( item.startDate ).format('lll')} ~ {moment.unix( item.endDate ).format('lll')} 
                                            </TableCell>
                                            <TableCell>
                                                <a href="#" onClick={this.handleDetailOpen.bind(this, index)}> 
                                                    {item.address == undefined ? 'Not deployed' : item.address} 
                                                </a>
                                            </TableCell>
                                            <TableCell> {item.state} </TableCell>
                                            <TableCell>
                                                { (this.state.stage == "3" 
                                                    && item.address != undefined 
                                                    && this.state.owner == this.props.auth.address 
                                                    && item.isEnded
                                                    && !item.isSettled) ? 
                                                        (
                                                            <IconButton onClick={this.handleHaltPoll.bind(this, index)}> <StopIcon/> </IconButton>
                                                        ) : ( null )
                                                } 
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                );
                            }) 
                        }
                    </Table>
                    <Dialog
                        open={this.state.openCreateForm}
                        onClose={this.handleCreateFormClose} >
                        { 
                            this.state.type == 'withdraw' ? ( 
                                <AddWithdrawPoll address={this.props.mainContractAddress} closeAction={this.handleCreateFormClose}/>
                            ) : <></> 
                        }
                        { 
                            this.state.type == 'crowdsale' ? ( 
                                <AddCrowdsalePoll address={this.props.mainContractAddress} closeAction={this.handleCreateFormClose}/>
                            ) : <></> 
                        }
                    </Dialog>
                    <Dialog
                        open={this.state.openDetail}
                        onClose={this.handleDetailClose} >
                        <DialogContent>
                            { 
                                this.state.activePoll.type == 'Additional Withdraw' ? ( 
                                    <DetailWithdrawPoll 
                                        item={this.state.activePoll} 
                                        address={this.props.mainContractAddress} 
                                        closeAction={this.handleDetailClose}/>
                                ) : <></> 
                            }
                            { 
                                this.state.activePoll.type == 'Additional Crowdsale' ? ( 
                                    <DetailCrowdsalePoll 
                                        item={this.state.activePoll} 
                                        address={this.props.mainContractAddress} 
                                        closeAction={this.handleDetailClose}/>
                                ) : <></> 
                            }
                        </DialogContent>
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
        //{ this.state.type == 'crowdsale' ? ( <AddCrowdsalePoll address={this.props.mainContractAddress} />) : null }
        //{ this.state.type == 'refund' ? ( <AddRefundPoll address={this.props.mainContractAddress} />) : null }
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(EventView);
