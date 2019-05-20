import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

// react-bootstrap
import Alert from 'react-bootstrap/Alert';

// material-ui components
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';

// icons
import ErrorIcon from '@material-ui/icons/Error';

// local components
import './AddWithdrawPoll.css';
import { web3 } from '../../../../../../web3';
import { contractHandlers } from '../../../../../../helpers/contracts';
import { statusActions } from '../../../../../../actions';
import { DATE_TIME_FORMAT } from '../../../../../../helpers/constants';
import utils from '../../../../../../helpers/utils';

// defines
const ERROR_MESSAGE_DATE_LIMIT = "End date should be later than start date.";
const ERROR_MESSAGE_DATE_IS_REQUIRED = "Date is required.";
const ERROR_MESSAGE_AMOUNT_LIMIT_MIN = "Amount should be larger than 0.";
const ERROR_MESSAGE_AMOUNT_LIMIT_MAX = "Amount cannot be exceeds summary of withdrawal.";

async function getWithdrawLimitation( mainAddress ){
    // calculate amount limit
    let crowdsale = await contractHandlers.getFirstCrowdsaleContract( mainAddress );
    let softcap = await web3._extend.utils.fromWei(crowdsale.sale_info()[2].toNumber());

    // roadmap summary 
    let totalWithdrawal = 0;
    let roadmaps = await contractHandlers.getRoadmaps( mainAddress );
    for( var roadmap of roadmaps ){
        totalWithdrawal += roadmap.withdrawal;
    }
    totalWithdrawal = await web3._extend.utils.fromWei(totalWithdrawal);

    //TODO additional withdrawal summary

    return { softcap: softcap, totalWithdrawal: totalWithdrawal, amountLimit: (softcap - totalWithdrawal) };
}

/*
 * @author. sena
 * @comment. 'AddWithdrawPoll' is a pop-up view to join crowdsale.
 */
class AddWithdrawPoll extends Component {
    state = {
        dateError: false,
        amountError: false,
        passwordError: false,
        error: false,
        startDate: moment().add(1, 'days'),
        endDate: moment().add(2, 'days'),
        softcap : 0,
        totalWithdrawal: 0
    };

    constructor(){
        super();

        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.handlepasswordChange = this.handlePasswordChange.bind(this);
        this.validationCheck = this.validationCheck.bind(this);
        this.createWithdrawPoll = this. createWithdrawPoll.bind(this);
    }

    handleDateChange( event, data ){
        this.setState({
            startDate: data.startDate,
            endDate: data.endDate,
            dateError: false
        });
    }

    handleAmountChange = ( event ) => {
        let amount = Number( event.target.value );
        this.setState({ amount: amount, amountError: false });
    }

    handlePasswordChange = ( event ) => {
        this.setState({ password: event.target.value, passwordError: false });
    }

    async validationCheck(){
        // 1. check date
        if( this.state.startDate == undefined || this.state.startDate == '' || this.state.endDate == undefined || this.state.endDate == '' ){
            this.setState({ dateError: true, message: ERROR_MESSAGE_DATE_IS_REQUIRED });
            return false ;
        }

        if( this.state.startDate.isSame( this.state.endDate, 'second') ){
            this.setState({ dateError: true, message: ERROR_MESSAGE_DATE_LIMIT });
            return false ;
        }

        // 2. check amount
        let limitation = getWithdrawLimitation( this.props.address ); // CRP
        if( limitation.amountLimit < this.state.amount ){
            this.setState({ amountError: true, message: ERROR_MESSAGE_AMOUNT_LIMIT_MAX });
            return false ;
        }

        if( this.state.amount == undefined || this.state.amount <= 0 ){
            this.setState({ amountError: true, message: ERROR_MESSAGE_AMOUNT_LIMIT_MIN });
            return false ;
        }

        // 3. check password
        let result = false;
        try{
            result = await web3.personal.unlockAccount( this.props.auth.address, this.state.password );
            if( !result ){
                this.setState({ passwordError: true, message: "Check your password." });
                result = false;
            }
        } catch( error ){
            if( error.message.includes("could not decrypt key with given passphrase") ){
                this.setState({ passwordError: true, message: "Check your password." });
            } else {
                console.error(error);
            }
            result = false;
        }
        return true;
    }

    async createWithdrawPoll(){
        if( !await this.validationCheck() ){ return; }

        this.props.dispatch( statusActions.start() );
        let params = {
            owner: {
                account: this.props.auth.address,
                password: this.state.password
            },
            address: this.props.address,
            amount: await web3._extend.utils.toWei( this.state.amount ),
            startDate: this.state.startDate.format('X'),
            endDate: this.state.endDate.format('X')
        };

        let message = '';
        let result = await contractHandlers.addWithdrawPoll( params );
        if( !result ){
            message = "Fail to Create. Try again.";
        }

        this.props.dispatch( statusActions.done() );
        this.setState({ error: result ? false : true, message: message });

        if( result ){
            this.props.closeAction();
        }
    }

    async componentWillMount(){
        let limitation = await getWithdrawLimitation( this.props.address );
        this.setState({ softcap: limitation.softcap, totalWithdrawal: limitation.totalWithdrawal });
    }

    render() {
        const locale = { format: DATE_TIME_FORMAT };

        return (
            <div className="add-withdraw-poll">
                <DatetimeRangePicker
                    timePicker
                    timePicker24Hour
                    timePickerIncrement={5}
                    locale={locale}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    minDate={moment()}
                    className="add-withdraw-poll-date"
                    onApply={this.handleDateChange}>
                    <TextField
                        error={this.state.dateError}
                        id="startDate"
                        label="Start date"
                        value={moment(this.state.startDate).format( DATE_TIME_FORMAT )}
                        className="textfield"
                        onChange={this.handleDateChange}
                    />
                    <TextField
                        error={this.state.dateError}
                        id="endDate"
                        label="End date"
                        value={moment(this.state.endDate).format( DATE_TIME_FORMAT )}
                        className="textfield"
                        onChange={this.handleDateChange}
                    />
                </DatetimeRangePicker>

                <TextField required
                    label="amount"
                    error={this.state.amountError}
                    type="number"
                    className="textfield"
                    onChange={this.handleAmountChange}
                    variant="outlined"
                    margin="normal" 
                    helperText={"Amount range : 0 ~ " + (this.state.softcap - this.state.totalWithdrawal) + " (softcap - summary of withdrawal)"}
                    InputProps={{ endAdornment: <InputAdornment position="end">CRP</InputAdornment>}}
                />

                <TextField
                    label="password"
                    type="password"
                    error={this.state.passwordError}
                    className="textfield"
                    onChange={this.handlePasswordChange}
                    variant="outlined"
                    margin="normal" />

                {
                    this.state.amountError || this.state.passwordError || this.state.dateError || this.state.error ? (
                        <div className="chip-div">
                            <Chip
                                icon={<ErrorIcon className="chip-icon"/>}
                                className={"status-chip"}
                                label={this.state.message} />
                        </div> ) : null
                }

                <Button
                    variant="contained"
                    color="primary"
                    className="purchase-btn"
                    onClick={this.createWithdrawPoll}> Create </Button>
            </div>
        );
    }
}

function mapStateToProps( state ) {
    return state.authentication;
}
export default connect(mapStateToProps)(AddWithdrawPoll);
