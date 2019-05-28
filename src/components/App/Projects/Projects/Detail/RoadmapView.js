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

// icon
import StartIcon from '@material-ui/icons/PlayCircleFilled';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
//import SaleIcon from '@material-ui/icons/MonetizationOn';

// local components
import './RoadmapView.css';
import { web3 } from '../../../../../web3';
import { contractHandlers } from '../../../../../helpers/contracts';
import { statusActions } from '../../../../../actions';

import DateGraph from '../../../../common/DateGraph';
import ConfirmPassword from '../../../../common/ConfirmPassword';

/*
 * @author. sena
 * @comment. 'RoadmapView' shows a address info.
 */
class RoadmapView extends Component {
    state = {
        openDetail: false,
        openConfirmPassword: false,
        roadmaps: [],
        activateRoadmap: {},
        activateFunction: null,
        page: 1
    };

    constructor(){
        super();
    }

    handleDetailOpen = async ( index, event ) => {
        let roadmap = this.state.roadmaps[index];

        // get my vote
        if( roadmap.address != undefined ){
            let result = await roadmap.contract.getVoteInfo( this.props.auth.address );
            roadmap.voteTime = result[0].toNumber();
            roadmap.vote = result[2];
        }

        let variant = "info";
        let header = "On polling";
        let message = "";

        if( roadmap.address == undefined || roadmap.startDate > moment().unix() ){ // not started 
            variant = "secondary";
            header = "Not strated yet!";
            message = "Voting begins at a predefined date. Evaluate the progress of the project.";
        } else if( roadmap.endDate < moment().unix() ) { // has ended
            variant = "dark";
            header = "Roadmap poll has ended.";
            message = `When the owner of the project finishes voting, the project continues or is canceled, depending on the outcome of the vote. The remaining amount of the canceled project will be refunded according to the investment rate, but the previously used amount can not be returned.` ;
            if( roadmap.voteTime != 0 ){
               message += `\n You had voted to ` + (roadmap.vote ? "Agree" : "Disagree") + ".";
            }
        } else if( roadmap.voteTime != 0 ) { // if voted
            variant = "success";
            header = "Check your vote";
            message = "You have already voted to '"
                        + (roadmap.vote ? "Agree" : "Disagree")
                        + "'. If you want to vote again, please click REVOKE button to cancel your vote first."

        } else { // if not voted yet
            header = "Check amount to be withdrawn and vote";
            message = "The amount stated above will be automatically transferred to the project owner upon approval. This is the minimum amount required for the project to continue and a new withdrawal vote will be made if additional funds are needed.";
        }

        if( roadmap.address != undefined && roadmap.startDate < moment().unix() && roadmap.endDate > moment().unix() ){
            roadmap.onPolling = true;
        } else {
            roadmap.onPolling = false;
        }

        this.setState({ 
            openDetail: true,
            activateRoadmap: roadmap,
            header: header,
            message: message,
            variant: variant
        });
    }

    handleDetailClose = () => {
        this.setState({ openDetail: false });
    }

    handleConfirmPasswordOpen = () => {
        this.setState({ openConfirmPassword: true });
    }

    handleConfirmPasswordClose = ( data ) => {
        this.setState({ openConfirmPassword: false, authorized: data.result, passcode: data.passcode }, () => { this.state.activateFunction(); });
    }

    handleHaltRoadmap = ( index ) => {
        this.setState({ openConfirmPassword: true, activateRoadmap: this.state.roadmaps[index], activateFunction: this.haltRoadmap.bind(this) });
    }

    select( symbol ){
        this.setState({ 
            symbol: symbol, 
            openConfirmPassword: true,
            activateFunction: this.vote.bind(this)
        });
    }

    async vote(){
        if( !this.state.authorized ){
            //TODO: Error. cannot get auth.
            return;
        }

        // check date
        if( this.state.activateRoadmap.endDate < moment().unix() ){
            alert('Roadmap poll has already ended.');
            return;
        }

        this.props.dispatch( statusActions.start() );

        let result = null;
        if( this.state.symbol == 0 || this.state.symbol == 1 ){
            // vote
            result = await contractHandlers.voteToRoadmapPoll({
                voter: {
                    account: this.props.auth.address,
                    password: this.state.passcode
                },
                symbol: this.state.symbol,
                address: this.props.mainContractAddress,
                roadmapAddress: this.state.activateRoadmap.address
            }).catch( (error) => {
                console.error( error );
                result = false;
            });
        } else {
            // revoke
            result = await contractHandlers.cancelVoteToRoadmapPoll({
                voter: {
                    account: this.props.auth.address,
                    password: this.state.passcode
                },
                address: this.props.mainContractAddress,
                roadmapAddress: this.state.activateRoadmap.address
            }).catch( (error) => {
                console.error( error );
                result = false;
            });
        }

        if( !result ){ alert("Voting failed. Maybe you don't have enough gas."); }

        this.props.dispatch( statusActions.done() );
        this.handleDetailClose();
    }

    async haltRoadmap(){
        if( !this.state.authorized ){
            //TODO: Error. cannot get auth.
            return;
        }

        this.props.dispatch( statusActions.start() );

        let roadmap = this.state.activateRoadmap;
        if( roadmap == null || roadmap == undefined || roadmap.address == '0x' || roadmap.address == 0x0 ){
            alert("Invalid roadmap.");
            return;
        }

        let params = {
            owner: {
                account: this.props.auth.address,
                password: this.state.passcode
            },
            address: this.state.contract.address,
            roadmapAddress: roadmap.address
        };

        let data = null;
        try{
            data = await contractHandlers.haltRoadmap( params );
        } catch( error ){
            console.error( error );
            data = { result: false };
        }

        this.props.dispatch( statusActions.done() );

        if( !data.result ){
            alert("Fail to halt roadmap. Try agin.");
        } else if( !data.roadmapResult ){
            alert("Fail to roadmap. The project has failed.");
        }

        //this.loadData();
        this.props.reloadFunction(2);
    }

    async loadData(){
        let contract = await contractHandlers.getMainContract( this.props.mainContractAddress );
        if( !contract ){ //TODO: Exception
            return;
        }

        let roadmaps = await contractHandlers.getRoadmaps( this.props.mainContractAddress );
        for( let roadmap of roadmaps ){
            let today = moment().unix();
            if( roadmap.address == undefined ){ 
                roadmap.state = 'Not started yet';
                continue;
            }

            let state = '';
            if( roadmap.startDate < today && roadmap.endDate > today ){ // onPolling
                state = 'On poll';
            } else if( roadmap.endDate < today ){
                state = 'Has ended';
            } else if( roadmap.startDate > today ){
                state = 'Now started';
            } else {
                state = 'unknown';
            }

            roadmap.state = state;
        }


        let canVote = await contractHandlers.isRelated( this.props.mainContractAddress, this.props.auth.address );
        //( await contract.owner() == this.props.auth.address );
        //let tokenContract = await contractHandlers.getTokenContract( this.props.mainContractAddress );
        //if( tokenContract != null && tokenContract != undefined && !canVote ){
        //    canVote = ( tokenContract.activeOf( this.props.auth.address ) > 0 ) ? true : false ;
        //}  

        this.setState({ 
            contract: contract,
            nowPosition: contract.getRoadmapContractNum() - 1,
            stage: contract.stage().toString(),
            roadmaps: roadmaps,
            canVote: canVote
        });
    }
    
    componentWillMount(){
        this.loadData();
    }

    render() {
        let variant = "warning";
        let header = "On Polling";
        let message = "";
        return (
            <div className="detail-roadmap">
                <div className="roadmap-list">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell> No. </TableCell>
                                <TableCell> Date </TableCell>
                                <TableCell> Withdrawal </TableCell>
                                <TableCell> Address </TableCell>
                                <TableCell> State </TableCell>
                                <TableCell> Functions </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        { 
                            this.state.roadmaps.map((item, index) => {
                                let indexString = index == 0 ? "1st" : (index == 1 ? "2nd" : (index == 2 ? "3rd" : (index + "th")));
                                return (
                                    <TableRow key={index}>
                                        <TableCell> {indexString} </TableCell>
                                        <TableCell align="center"> 
                                            {moment.unix( item.startDate ).format('lll')} ~ {moment.unix( item.endDate ).format('lll')} 
                                        </TableCell>
                                        <TableCell> {web3._extend.utils.fromWei( item.withdrawal )} CRP </TableCell>
                                        <TableCell align="center">
                                            <a href="#" onClick={this.handleDetailOpen.bind(this, index)}> 
                                                {item.address == undefined ? 'Not deployed' : item.address} 
                                            </a>
                                        </TableCell>
                                        <TableCell> {item.state} </TableCell>
                                        <TableCell>
                                            { this.state.stage == "3" && item.address != undefined && item.owner == this.props.auth.address && item.endDate < moment().unix() && this.state.nowPosition == index ? (
                                                <IconButton onClick={this.handleHaltRoadmap.bind(this, index)}> <StopIcon/> </IconButton>
                                            ) : ( null )} 
                                        </TableCell>
                                    </TableRow>
                                );
                            }) 
                        }
                        </TableBody>
                    </Table>
                    <Dialog
                        fullWidth={true}
                        maxWidth="sm"
                        open={this.state.openDetail}
                        onClose={this.handleDetailClose}>
                        <DialogTitle id="alert-dialog-title">Roadmap Detail<p className="label">{this.state.activateRoadmap.address}</p></DialogTitle>
                        <DialogContent>
                            <div className="roadmap-detail-contents">
                                <DateGraph 
                                    startDate={this.state.activateRoadmap.startDate} 
                                    endDate={this.state.activateRoadmap.endDate}/>
                                <div className="withdrawal">
                                    <span className="withdrawal">Withdrawal : </span>
                                    <span className="withdrawal-amount">{web3._extend.utils.fromWei(this.state.activateRoadmap.withdrawal)}</span>
                                    <span className="withdrawal-label"> CRP</span>
                                </div>

                                <Alert variant={this.state.variant} className="info-alert">
                                    <Alert.Heading>{this.state.header}</Alert.Heading>
                                    <p>{this.state.message}</p>
                                </Alert>

                                <div className="btn-group">
                                    {
                                        ( this.state.canVote && this.state.activateRoadmap.onPolling ) ?
                                            ( this.state.activateRoadmap.voteTime == 0 ? 
                                                (
                                                    <>
                                                    <Button variant="contained" className="vote-btn agree" onClick={this.select.bind(this, 1)}> Agree </Button>
                                                    <Button variant="contained" className="vote-btn disagree" onClick={this.select.bind(this, 0)}> Disagree </Button>
                                                    </>
                                                ) : (
                                                    <Button variant="contained" className="vote-btn revoke" onClick={this.select.bind(this, 2)}> Revoke </Button>
                                                ) 
                                            ) : null
                                    }
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleDetailClose} color="primary" autoFocus> Close </Button>
                        </DialogActions>
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
export default connect(mapStateToProps)(RoadmapView);
