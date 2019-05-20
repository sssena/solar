import React, { Component } from 'react';
import { connect } from 'react-redux';

// material-ui components
import Dialog from '@material-ui/core/Dialog';
import Collapse from '@material-ui/core/Collapse';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import InputAdornment from '@material-ui/core/InputAdornment';

// icons
import ErrorIcon from '@material-ui/icons/Error';
import DoneIcon from '@material-ui/icons/Done';

// local components
import './SendTransaction.css';
import { web3 } from '../../../../web3';
//import web3 from '../../../../web3';
import utils from '../../../../helpers/utils';
import { statusActions } from '../../../../actions'

const ERROR_MESSAGE_TO_IS_EMPTY = "To field is required.";
const ERROR_MESSAGE_IS_NOT_ADDRESS = "To field should be address.";
const ERROR_MESSAGE_VALUE_IS_EMPTY = "Value field is required.";
const ERROR_MESSAGE_PASSWORD_IS_EMPTY = "Password field is required.";
const ERROR_MESSAGE_FAIL_TO_UNLOCK_ACCOUNT = "Fail to unlock account. Check your password.";
const ERROR_MESSAGE_NOT_ENOUGH_VALUE = "There is not enough balance.";
const ERROR_MESSAGE_FAIL_TO_GET_BALANCE = "Fail to get balance. Try again.";

const DEFAULT_UNLOCK_ACCOUNT_DURATION = 300; // same with ethereum default.

/*
 * @author. sena
 * @comment. 'SendTransaction' is a component for sending coin(CRP).
 */
class SendTransaction extends Component {
    state = {
        to: '',
        value: 0,
        password: '',
        toError: false,
        ValueError: false,
        passwordError: false,
        error: false,
        message: ''
        //optionsOpen: false
    };

    constructor(){
        super();

        this.sendTransaction = this.sendTransaction.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    toggleOptions = () => {
        this.setState( state => ({ optionsOpen: !state.optionsOpen }));
    }

    handleToChange = ( event ) => {
        let to = event.target.value;
        this.setState({ to: to });
    }

    handleValueChange = ( event ) => {
        let value = Number(event.target.value);
        this.setState({ value: value });
    }

    handlePasswordChange = ( event ) => {
        let password = event.target.value;
        this.setState({ password: password });
    }

    // validationCheck
    toValidationCheck(){
        let to = this.state.to;

        if( to == '' ) {
            this.setState({ toError: true, message: ERROR_MESSAGE_TO_IS_EMPTY });
            return false;
        }

        if( !utils.isAddress( to ) ){
            this.setState({ toError: true, message: ERROR_MESSAGE_IS_NOT_ADDRESS });
            return false;
        }

        this.setState({ toError: false, message: '' });
        return true;
    }

    async valueValidationCheck(){
        let value = this.state.value;

        if( isNaN(value) ) {
            this.setState({ valueError: true, message: ERROR_MESSAGE_VALUE_IS_EMPTY });
            return false;
        }

        if( value >= this.props.balance ){
            this.setState({ valueError: true, message: ERROR_MESSAGE_NOT_ENOUGH_VALUE });
            return false;
        }

        this.setState({ valueError: false, message: '' });
        return true;
    }

    async passwordValidationCheck(){
        let password = this.state.password;
        let result = false;
        try{
            // unlock account with password
            result = await web3.personal.unlockAccount( this.props.address, password, DEFAULT_UNLOCK_ACCOUNT_DURATION );
        } catch ( error ){
            this.setState({ passwordError: true, message: ERROR_MESSAGE_FAIL_TO_UNLOCK_ACCOUNT });
            result = false;
        }

        if( result ){
            // clear error message
            this.setState({ passwordError: false, message: '' });
        }
        return result;
    }

    async sendTransaction() {
        this.props.dispatch( statusActions.start() );

        if ( !this.toValidationCheck() || ! await this.valueValidationCheck() || ! await this.passwordValidationCheck() ) {
            this.props.dispatch( statusActions.done() );
            return;
        }

        let value = await web3._extend.utils.toWei( this.state.value );
        let result = false;
        try{
            result = await web3.eth.sendTransaction({
                from: this.props.address,
                to: this.state.to,
                value: value,
                txType: "Normal"
            });
        } catch( error ) {
            console.error( error );
            result = false;
        }

        if( !result ) { // TODO: processing error? 
        }

        this.props.dispatch( statusActions.done() );
        this.props.closeAction( true );
    }

    render() {
        // setting chip icon
        let icon = null;
        let chipClass = 'chip-none';
        if( this.state.toError || this.state.valueError || this.state.passwordError ) {
            chipClass = 'chip-error'
            icon = <ErrorIcon className="chip-icon"/>;
        } else if( this.state.to == '' || this.state.value == '' ){
            chipClass = 'chip-none';
            icon = <DoneIcon className="chip-icon"/>;
        } else {
            chipClass = 'chip-done';
            icon = <DoneIcon className="chip-icon"/>;
        }

        // Node function error
        if ( this.state.error ){
            chipClass = 'chip-error';
            icon = <ErrorIcon className="chip-icon"/>;
        }

        return (
            <div className="sendtx-form">
                <TextField required
                    disabled
                    id="from"
                    label="From"
                    defaultValue={this.props.address}
                    className="textfield"
                    variant="outlined"
                    margin="normal" />

                <TextField required
                    id="to"
                    label="To"
                    className={this.state.toError ? "textfield error" : "textfield"}
                    onChange={this.handleToChange}
                    variant="outlined"
                    margin="normal" />

                <TextField required
                    id="value"
                    label="Value"
                    type="number"
                    className={this.state.valueError ? "textfield error" : "textfield"}
                    onChange={this.handleValueChange}
                    variant="outlined"
                    margin="normal" 
                    InputProps={{ endAdornment: <InputAdornment position="end">CRP</InputAdornment>}} />

                <TextField required
                    id="password"
                    label="Password"
                    helper="Password of Wallet account"
                    type="password"
                    className={this.state.passwordError ? "textfield error" : "textfield"}
                    onChange={this.handlePasswordChange}
                    variant="outlined"
                    margin="normal" />

                <div className="chip-div">
                    <Chip
                        icon={icon}
                        className={chipClass}
                        label={this.state.message} />
                </div>

                <Button
                    variant="contained"
                    color="primary"
                    className="sendtx-btn"
                    onClick={this.sendTransaction}> Send </Button>

            </div>
        );
        
        //<Button onClick={this.toggleOptions}> More Options </Button>
        //       <Collapse in={this.state.optionsOpen} timeout="auto" unmountOnExit>
        //          gas options here
        //      </Collapse>
    }
}

function mapStateToProps( state ){
    return state;
}
export default connect(mapStateToProps)(SendTransaction);
