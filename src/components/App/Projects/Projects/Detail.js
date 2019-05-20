import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// material-ui components
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Badge from '@material-ui/core/Badge';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

// icons
import LensIcon from '@material-ui/icons/Lens';

// local components
import './Detail.css';
import { contractHandlers } from '../../../../helpers/contracts';
import { getStageLabel } from '../../../common/Labels';

// Detail views
import TokenView from './Detail/TokenView';
import CrowdsaleView from './Detail/CrowdsaleView';
import RoadmapView from './Detail/RoadmapView';
import StaffPoll from './Detail/StaffPoll';
import TransactionView from './Detail/TransactionView';
import EventView from './Detail/EventView';

/*
 * @author. sena
 * @comment. 'Detail' is a page of project detail.
 */
class Detail extends Component {
    state = {
        activeStep: 0, 
        openVoteDialog: false,
        stage: null
    };

    constructor(){
        super();

        this.reloadPage = this.reloadPage.bind(this);
    }

    handleVoteDialogOpen = ( event ) => {
        this.setState({
            openVoteDialog: true
        });
    }

    handleVoteDialogClose = ( answer ) => {
        let step = this.state.activeStep;

        // go to poll tab
        if( answer ){ 
            if( this.state.onPolling == 'roadmap') step = 2; 
            else step = 5;
        }

        this.setState({
            openVoteDialog: false,
            activeStep: step
        });
    }
    
    handleStep = ( event, index ) => {
        this.setState({ activeStep: index });
    }

    getSteps(){
        let steps = ["Token", "Crowdsales", "Roadmaps", "Events", "Transactions"];
        if( this.state.onPolling == 'staffpoll' ){ steps.push( "Poll" ); }

        return steps;
    }

    getStepContent( step ){
        switch( step ){
            case 0:
                return ( <TokenView mainContractAddress={this.state.mainContractAddress} /> );
                break;
            case 1:
                return ( <CrowdsaleView mainContractAddress={this.state.mainContractAddress} reloadFunction={this.reloadPage}/> );
                break;
            case 2:
                return ( <RoadmapView mainContractAddress={this.state.mainContractAddress} reloadFunction={this.reloadPage}/> );
                break;
            case 3:
                return ( <EventView mainContractAddress={this.state.mainContractAddress} reloadFunction={this.reloadPage}/> );
                break;
            case 4:
                return ( <TransactionView mainContractAddress={this.state.mainContractAddress} /> );
                break;
            case 5:
                if( this.state.stage == "0" ) { // get staff-poll
                    return ( <StaffPoll mainContractAddress={this.state.mainContractAddress} reloadFunction={this.reloadPage}/> )
                } // TODO: aditional polls 
                break;
            default:
                return ;
        }
    }

    async reloadPage( activeStep ){
        await this.setState({ activeStep: activeStep });
        await this.loadProjectDetail();
    }

    async loadProjectDetail(){
        let contract = await contractHandlers.getMainContract( this.props.match.params.address );
        if( !contract ){ 
            return;
            //TODO: Exception
        }

        let stage = contract.stage().toString();
        let title = contract.title();
        let message = '';
        let openVoteDialog = false;
        let onPolling = false;

        // staff-poll check
        if( stage == "0" ){
            let staffInfo = await contractHandlers.getStaffInfo({ contract: contract, staffAddress: this.props.auth.address});
            let staffPollInfo = await contractHandlers.getStaffPollInfo({ contract: contract });
            let today = moment().unix();

            if( staffPollInfo.startDate < today && staffPollInfo.endDate > today  // poll date check
                && staffInfo.holdingRatio != 0 && staffInfo.votedTime == 0 ){ // staff check
                onPolling = 'staffpoll';
                openVoteDialog = true;
                message = `You have not joined the ongoing staff-poll yet. 
                    If all staff do not vote, the project may be canceled. Go to the poll menu?`;
            }

            if( contract.owner() == this.props.auth.address ){
                onPolling = 'staffpoll'; // owner should halt staff poll
            }
        }

        let onPollRoadmap = await contractHandlers.onPolling( this.props.match.params.address );
        //console.log( onPollRoadmap.contract )
        //console.log( onPollRoadmap.contract.getVoteInfo( this.props.auth.address )[0].toNumber() )
        if( onPollRoadmap != false
            && this.state.activeStep != 2
            && await contractHandlers.isRelated( this.props.match.params.address, this.props.auth.address )
            && ( await onPollRoadmap.contract.getVoteInfo( this.props.auth.address )[0] ).toNumber() == 0 ) { // roadmap poll
            onPolling = 'roadmap';
            openVoteDialog = true;
            message = `There is an ongoing poll. Go to the poll menu?`;
        }

        this.setState({
            openVoteDialog: openVoteDialog,
            mainContractAddress: this.props.match.params.address, // needs by staffpoll
            contract: contract,
            title: title,
            stage: stage,
            message: message,
            onPolling: onPolling,
            onSale: await contractHandlers.onSale( this.props.match.params.address )
        });
    }

    async componentWillMount(){
        await this.loadProjectDetail();
    }

    render() {
        let stage = getStageLabel( this.state.stage );
        const steps = this.getSteps();
        return (
            <div className="detail">
                <h2 className="title">{this.state.title}</h2> {stage}
                <p className="address">{this.props.match.params.address}</p>
                <Tabs value={this.state.activeStep} onChange={this.handleStep} indicatorColor="primary" textColor="primary" >
                    {
                        steps.map( (label, index) => {
                            if(label == "Roadmaps" && this.state.onPolling == 'roadmap')
                                return( 
                                    <Tab 
                                        key={label} 
                                        label={ <Badge className="on-poll-badge" color="primary" variant="dot"> {label} </Badge> } 
                                        value={index}/>
                                );
                            else if(label == "Crowdsales" && this.state.onSale)
                                return( 
                                    <Tab 
                                        key={label} 
                                        label={ <Badge className="on-poll-badge" color="primary" variant="dot"> {label} </Badge> } 
                                        value={index}/>
                                );
                            else
                                return( <Tab key={label} label={label} value={index}/> );
                        }) 
                    }
                </Tabs>
                <div className="detail-view">
                    { this.state.mainContractAddress == undefined ? null : this.getStepContent(this.state.activeStep) }
                </div>
                <Dialog open={this.state.openVoteDialog} onClose={this.handleVoteDialogClose} >
                    <DialogTitle> {"Go to vote!"} </DialogTitle>
                    <DialogContent>
                        <DialogContentText> {this.state.message} </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleVoteDialogClose.bind(this, false)} color="secondary"> Cancel </Button>
                        <Button onClick={this.handleVoteDialogClose.bind(this, true)} color="primary"> Ok </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(Detail);
