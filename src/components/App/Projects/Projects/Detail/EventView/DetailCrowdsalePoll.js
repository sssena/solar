import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// charts
import { Pie } from 'react-chartjs-2';

// react-bootstrap
import Alert from 'react-bootstrap/Alert';

// material-ui components
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

// icons
import ErrorIcon from '@material-ui/icons/Error';

// local components
import './DetailCrowdsalePoll.css';
import { web3 } from '../../../../../../web3';
import { contractHandlers } from '../../../../../../helpers/contracts';
import { statusActions } from '../../../../../../actions';
import utils from '../../../../../../helpers/utils';
import DateGraph from '../../../../../common/DateGraph';
import VoteResultGraph from '../../../../../common/VoteResultGraph';
import ConfirmPassword from '../../../../../common/ConfirmPassword';

/*
 * @author. sena
 * @comment. 'DetailCrowdsalePoll' is a pop-up view of withdraw poll.
 */
class DetailCrowdsalePoll extends Component {
    state = {
        voteInfo:{
            variant: "info",
            message: "",
            header: ""
        },
        openConfirmPassword: false,
        saleInfo:{},
        resultData: {}
    };

    constructor(){
        super();

        this.load = this.load.bind(this);
        this.getResultData = this.getResultData.bind(this);
        this.getVoteInfo = this.getVoteInfo.bind(this);
    }

    select( symbol ){
        this.setState({
            symbol: symbol,
            openConfirmPassword: true,
            activateFunction: this.vote.bind(this)
        });
    }

    handleConfirmPasswordOpen = () => {
        this.setState({ openConfirmPassword: true });
    }

    handleConfirmPasswordClose = ( data ) => {
        this.setState({ openConfirmPassword: false, authorized: data.result, passcode: data.passcode }, () => { this.state.activateFunction(); });
    }

    async vote(){
        if( !this.state.authorized ){
            //TODO: Error. cannot get auth.
            return;
        }

        // check date
        if( this.state.isEnded ){
            alert('Poll has already ended.');
            return;
        }

        this.props.dispatch( statusActions.start() );

        let result = null;
        if( this.state.symbol == 0 || this.state.symbol == 1 ){
            // vote
            result = await contractHandlers.voteToPoll({
                type: 'crowdsale',
                voter: {
                    account: this.props.auth.address,
                    password: this.state.passcode
                },
                symbol: this.state.symbol,
                pollAddress: this.props.item.address
            }).catch( (error) => {
                console.error( error );
                result = false;
            });
        } else {
            // revoke
            result = await contractHandlers.cancelVoteToPoll({
                type: 'crowdsale',
                voter: {
                    account: this.props.auth.address,
                    password: this.state.passcode
                },
                pollAddress: this.props.item.address
            }).catch( (error) => {
                console.error( error );
                result = false;
            });
        }

        if( !result ){ alert("Voting failed. Maybe you don't have enough gas."); }

        this.props.dispatch( statusActions.done() );
        this.props.closeAction();
    }

    async getVoteInfo( poll ){
        let variant = "info";
        let message = "";
        let header = "";
        let vote = poll.getVoteInfo( this.props.auth.address );

        if( poll.isEnded ) { // has ended
            variant = "secondary";
            header = "Poll has been ended!";
            message += `\n You had voted to ` + (vote[2] ? "Agree" : "Disagree") + ". Check the result below.";
        } else if( vote[0].toNumber() == 0 ){ // if not voted yet
            header = "Vote to additional Crowdsale";
            message = "If more than 70% agree, the new crowdsale will be created. Vote to additional crowdsale.";
        } else if( vote[0].toNumber() != 0 ){ // has voted
            header = "Check your vote";
            message = "You have already voted to '"
                + (vote[2] ? "Agree" : "Disagree")
                + "'. If you want to vote again, please click REVOKE button to cancel your vote first.";
        }

        return {
            variant: variant,
            header: header,
            message: message,
            vote: vote
        };
    }

    async getResultData( poll ){
        let position = poll.head();
        let voter = poll.voter_count().toNumber();
        let tokenContract = await contractHandlers.getTokenContract( this.props.address )
        if( tokenContract == null ){
            return false;
        }

        let agree = 0;
        let agreeWeight = 0;
        let disagree = 0;
        let disagreeWeight = 0;
        for(var i = 0; i < voter; i++ ){
            let vote = poll.getVoteInfo( position );
            let tokenBalance = await web3._extend.utils.fromWei( tokenContract.balanceOf( position ) );

            if( vote[2] ){
                agree++;
                agreeWeight += tokenBalance;
            } else {
                disagree++;
                disagreeWeight += tokenBalance;
            }
            position = vote[4];
        }
        let totalSupply = await web3._extend.utils.fromWei( tokenContract.supply().toNumber() );

        return {
            agree: agree,
            agreeWeight: (agreeWeight/totalSupply).toFixed(2) * 100,
            disagree: disagree,
            disagreeWeight: (disagreeWeight/totalSupply).toFixed(2) * 100,
            symbol: tokenContract.symbol()
        };
    }

    async load(){
        let poll = await contractHandlers.getCrowdsalePoll( this.props.item.address );
        let state = "";
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

        let canVote = await contractHandlers.isRelated( this.props.address, this.props.auth.address );
        let resultData = await this.getResultData( poll );
        let voteInfo = await this.getVoteInfo( poll );
        let saleInfo = poll.sale_info();

        this.setState({ 
            saleInfo:{
                startDate: saleInfo[0].toNumber(),
                endDate: saleInfo[1].toNumber(),
                premiumEndDate: saleInfo[2].toNumber(),
                min: await web3._extend.utils.fromWei( saleInfo[3].toNumber() ),
                max: await web3._extend.utils.fromWei( saleInfo[4].toNumber() ),
                hardcap: await web3._extend.utils.fromWei( saleInfo[5].toNumber() ),
                rate: saleInfo[6].toNumber()
            },
            isEnded: poll.isEnded,
            isSettled: poll.isSettled,
            state: state,
            result: poll.result_poll().toString() == "true" ? "SUCCESS" : "FAIL",
            resultData: resultData,
            canVote: canVote,
            voteInfo: voteInfo
        });
    }

    async componentWillMount(){
        await this.load();
    }

    render() {
        return (
            <div className="detail-crowdsale-poll">
                <div className="poll-title">
                    <h3>Event Poll Detail</h3><span>{this.state.state}</span>
                    <p className="address">{this.props.item.address}</p>
                </div>
                <div className="poll-info">
                    <DateGraph startDate={this.props.item.startDate} endDate={this.props.item.endDate}/>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Sale</TableCell>
                                <TableCell> {moment.unix(this.state.saleInfo.startDate).format('lll')} ~ {moment.unix(this.state.saleInfo.endDate).format('lll')} </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Premium Sale</TableCell>
                                <TableCell> {moment.unix(this.state.saleInfo.startDate).format('lll')} ~ {moment.unix(this.state.saleInfo.premiumEndDate).format('lll')} </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Hardcap</TableCell>
                                <TableCell> {this.state.saleInfo.hardcap} CRP </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Min/Max</TableCell>
                                <TableCell> {this.state.saleInfo.min} / {this.state.saleInfo.max} CRP </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Rate</TableCell>
                                <TableCell> 1CRP : {this.state.saleInfo.rate}{this.state.resultData.symbol} </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <Alert variant={this.state.voteInfo.variant} className="info-alert">
                    <Alert.Heading>{this.state.voteInfo.header}</Alert.Heading>
                    <p>{this.state.voteInfo.message}</p>
                </Alert>
                <div className="poll-vote">
                    {
                        this.state.isSettled ? (
                            <VoteResultGraph 
                                agree={this.state.resultData.agree} 
                                agreeWeight={this.state.resultData.agreeWeight}
                                disagree={this.state.resultData.disagree} 
                                disagreeWeight={this.state.resultData.disagreeWeight} />
                        ) : (
                            <div className="btn-group">
                                {
                                    ( this.state.canVote && !this.state.isEnded ) ?
                                        ( this.state.voteInfo.vote[0].toNumber() == 0 ?
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
                        )
                    }
                </div>
                <DialogActions>
                    <Button onClick={this.props.closeAction} color="primary" autoFocus> Close </Button>
                </DialogActions>

                <Dialog
                    open={this.state.openConfirmPassword}
                    onClose={this.handleConfirmPasswordClose} >
                    <ConfirmPassword
                        useUnlock={true}
                        closeAction={this.handleConfirmPasswordClose} />
                </Dialog>

            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(DetailCrowdsalePoll);
