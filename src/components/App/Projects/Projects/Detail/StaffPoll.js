import React, { Component } from 'react';
import { connect } from 'react-redux';
import path from 'path';
import moment from 'moment';

// charts
import { Pie } from 'react-chartjs-2';

// bootstrap components
import Alert from 'react-bootstrap/Alert';

// material-ui components
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ConfirmPassword from '../../../../common/ConfirmPassword';

// local components
import './StaffPoll.css';
import { web3 } from '../../../../../web3';
import { history } from '../../../../../helpers/history';
import { contractHandlers } from '../../../../../helpers/contracts';
import DateGraph from '../../../../common/DateGraph';
import { statusActions } from '../../../../../actions'

/*
 * @author. sena
 * @comment. 'StaffPoll' shows a address info.
 */
class StaffPoll extends Component {
    state = {
        authorized: false,
        openConfirmPassword: false,
        activateFunction: null
    };

    constructor(){
        super();
    }

    handleConfirmPasswordOpen = () => {
        this.setState({ openConfirmPassword: true });
    }

    handleConfirmPasswordClose = ( data ) => {
        this.setState({ 
            openConfirmPassword: false, 
            authorized: data.result, 
            passcode: data.passcode 
        },
            () => { this.state.activateFunction(); }
        );
    }

    confirm(){
        // 1. check user is owner
        if( this.state.owner != this.props.auth.address ){
            alert("You are not owner of this project. check the accounts.");
            return;
        }

        // 2. run halt function
        this.setState({ openConfirmPassword: true, activateFunction: this.halt.bind(this) });
    }

    async halt(){
        if( !this.state.authorized ){
            //TODO: Error. cannot get auth.
            return;
        }

        // check date
        if( this.state.staffPollInfo.endDate > moment().unix() ){
            alert('Staff poll is on progress.');
            return;
        }

        this.props.dispatch( statusActions.start() );

        let data = await contractHandlers.haltStaffPoll({
            owner: {
                account: this.props.auth.address,
                password: this.state.passcode
            },
            contractAddress: this.props.mainContractAddress
        }).catch( (error) => {
            console.error( error );
            data = { result: false, startproject: false };
        });

        if( data.result == undefined ){
            alert('Error occured during halt staff poll.');
        }

        if( !data.result ){
            alert("Halting failed. Maybe you don't have enough gas.");
        } else if ( !data.startProject ){
            alert("The project failed because some of the staff objected to the project.");
        }

        this.props.dispatch( statusActions.done() );
        this.props.reloadFunction( 0 ); // reload detail page
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
        if( this.state.staffPollInfo.endDate < moment().unix() ){
            alert('Staff poll has already ended.');
            return;
        }

        this.props.dispatch( statusActions.start() );

        let result = null;
        if( this.state.symbol == 0 || this.state.symbol == 1 ){
            // vote
            result = await contractHandlers.voteToStaffPoll({
                voter: {
                    account: this.props.auth.address,
                    password: this.state.passcode
                },
                symbol: this.state.symbol,
                contractAddress: this.props.mainContractAddress
            }).catch( (error) => {
                console.error( error );
                result = false;
            });
        } else {
            // revoke
            result = await contractHandlers.cancelVoteToStaffPoll({
                voter: {
                    account: this.props.auth.address,
                    password: this.state.passcode
                },
                contractAddress: this.props.mainContractAddress
            }).catch( (error) => { 
                console.error( error );
                result = false;
            });
        }

        if( !result ){
            alert("Voting failed. Maybe you don't have enough gas.");
        }
        this.props.dispatch( statusActions.done() );
        this.loadData(); // reload
    }

    
    async loadData(){ 
        let contract = await contractHandlers.getMainContract( this.props.mainContractAddress );
        if( !contract ){ 
            return;
        }

        let staffInfo = await contractHandlers.getStaffInfo({ contract: contract, staffAddress: this.props.auth.address});
        let staffPollInfo = await contractHandlers.getStaffPollInfo({ contract: contract });

        let staffCount = 0;
        if( staffPollInfo.endDate < moment().unix() ){
            let agreeCount = 0, disagreeCount = 0, absentCount = 0;
            let staff = await contractHandlers.getStaffInfo({ contract: contract, staffAddress: staffPollInfo.head }); // get head staff
            while( staff ){
                if( staff.votedTime == 0 ) { 
                    absentCount++; 
                } else{ 
                    staff.vote ? agreeCount++ : disagreeCount++; 
                }

                if( staff.next == 0x0 || staff.next == undefined ) break;
                staff = await contractHandlers.getStaffInfo({ contract: contract, staffAddress: staff.next });
            }

            this.setState({
                agreeCount: agreeCount,
                disagreeCount: disagreeCount,
                absentCount: absentCount
            });
        }

        await this.setState({
            today: moment().unix(),
            owner: contract.owner(),
            staffPollInfo: staffPollInfo,
            staffInfo: staffInfo
        });
    }

    async componentWillMount(){
        await this.loadData();
    }

    render() {
        if( this.state.staffInfo == undefined || this.state.staffPollInfo == undefined ){
            //If state is not ready, return empty screen.
            return null;
        }

        // pie chart data
        let staffData = {
            labels: ['You', 'Others'],
            datasets:[{
                label: '# of Staff',
                data: [ this.state.staffInfo.holdingRatio, (100 - this.state.staffInfo.holdingRatio)],
                backgroundColor: [
                    '#87bdd8',
                    '#E3E3E3'
                ]
            }]
        };

        let resultData = {
            labels: ['Agree', 'Disagree', 'Absent'],
            datasets:[{
                label: '# of Staff',
                data: [ this.state.agreeCount, this.state.disagreeCount, this.state.absentCount ],
                backgroundColor: [
                    '#80ced6',
                    '#bc5a45',
                    '#b2b2b2'
                ]
            }]
        };

        // info alert messages
        let variant = "success";
        let infoHeader = "";
        let infoMessage = "";
        if ( this.state.staffPollInfo.endDate < moment().unix() ){ // voted
            variant = "info";
            infoHeader = "Staff poll has ended.";
            infoMessage = `When the owner finishes voting, the project will start in earnest.
                           Complete your work. You have voted to ` + (this.state.staffInfo.vote ? "Agree" : "Disagree") + ".";
        }else if( this.state.staffInfo.votedTime == 0 ){ // no vote
            variant = "success";
            infoHeader = "Check your ratio and vote";
            infoMessage = `In order for this project to move on to the next step, all staff must agree to proceed with the project.
                           Otherwise, this project will be canceled and will have to create over again.`;
        } else if ( this.state.staffInfo.votedTime != 0 ){ // voted
            variant = "info";
            infoHeader = "Check your vote";
            infoMessage = "You have already voted to '" 
                        + (this.state.staffInfo.vote ? "Agree" : "Disagree") 
                        + "'. If you want to vote again, please click REVOKE button to cancel your vote first."
        }

        return (
            <div className="detail-staffpoll">
                <div className="date-graph">
                    <DateGraph onRunning={true} startDate={this.state.staffPollInfo.startDate} endDate={this.state.staffPollInfo.endDate}/>
                </div>
                <Alert variant={variant} className="info-alert">
                    <Alert.Heading>{infoHeader}</Alert.Heading>
                    <p>{infoMessage}</p>
                </Alert>
                {
                    this.state.staffPollInfo.endDate > moment().unix() ?
                        <div className="staff-info">
                            <Pie data={staffData} width={100} height={50} className="chart"/>
                        </div>
                        : <div className="staff-poll-result">
                            <Pie data={resultData} width={100} height={50} className="chart"/>
                        </div>
                }
                <div className="btn-group">
                    {
                        this.state.staffPollInfo.endDate > moment().unix() ? 
                            // on polling 
                            this.state.staffInfo.votedTime == 0 ?
                            <>
                            <Button variant="contained" className="vote-btn agree" onClick={this.select.bind(this, 1)}> Agree </Button>
                            <Button variant="contained" className="vote-btn disagree" onClick={this.select.bind(this, 0)}> Disagree </Button>
                            </>
                            : <Button variant="contained" className="vote-btn revoke" onClick={this.select.bind(this, 2)}> Revoke </Button>
                            :
                            // ended TODO
                            this.state.owner == this.props.auth.address ?
                            <Button variant="contained" className="vote-btn confirm" onClick={this.confirm.bind(this)}> Confirm(Halt) </Button>
                            : null
                    }
                </div>
                <Dialog
                    open={this.state.openConfirmPassword}
                    onClose={this.handleConfirmPasswordClose} >
                    <ConfirmPassword
                        useUnlock={true}
                        closeAction={this.handleConfirmPasswordClose} />
                </Dialog>
            </div>
            //<img src={path.join(__dirname, '../public/imgs/vote.png')} className="vote-img"/>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(StaffPoll);
