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

// icons
import ErrorIcon from '@material-ui/icons/Error';

// local components
import './AddRefundPoll.css';
import { web3 } from '../../web3';
import { contractHandlers } from '../../../../../helpers/contracts';
import { statusActions } from '../../../../../actions';
import utils from '../../helpers/utils';

/*
 * @author. sena
 * @comment. 'AddRefundPoll' is a pop-up view to join crowdsale.
 */
class AddRefundPoll extends Component {
    state = {
    };

    constructor(){
        super();
    }

    handleDateChange( event, data ){
        let dateError = false;
        let message = '';

        // check empty
        if( data.startDate == undefined || data.startDate == '' || data.endDate == undefined || data.endDate == '' ){
            dateError = true;
            message = ERROR_MESSAGE_DATE_IS_REQUIRED;
        }

        if( data.startDate.isSame( data.endDate, 'second') ){
            dateError = true;
            message = ERROR_MESSAGE_DATE_LIMIT;
        }

        this.setState({
            date: data,
            dataError: dataError,
            message: message
        });
    }

    handleAmountChange = ( event ) => {
        let amount = Number( event.target.value );
        this.setState({ amount: amount });
    }

    handlePasswordChange = ( event ) => {
        this.setState({ password: event.target.value });
    }

    async validationCheck(){
        //TODO
    }

    render() {
        return (
            <div className="add-withdraw-poll">
                <DatetimeRangePicker
                    timePicker
                    timePicker24Hour
                    timePickerIncrement={5}
                    locale={locale}
                    startDate={moment().unix()}
                    endDate={moment().unix()}
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
                    value={this.state.amount}
                    onChange={this.handleAmountChange}
                    variant="outlined"
                    margin="normal" 
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
export default connect(mapStateToProps)(AddRefundPoll);
